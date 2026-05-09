const api = require('../../utils/api');
const format = require('../../utils/format');

Page({
  data: {
    loading: true,
    overview: null,
    patients: [],
    selectedIndex: 0,
    patient: null,
    analysis: null,
    riskLevel: 'medium',
    riskText: '中风险',
    riskScore: '--',
    vascularAgeDelta: 0,
    summary: '正在加载多模态健康数据。',
    metrics: [],
    vitals: [],
    trendRows: [],
    actions: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (this.data.patient) {
      this.loadPatient(this.data.patient.id);
    }
  },

  async loadData() {
    this.setData({ loading: true });
    const [overview, patients] = await Promise.all([api.fetchOverview(), api.fetchPatients()]);
    const patientId = api.currentPatientId();
    const selectedIndex = Math.max(
      0,
      patients.findIndex((patient) => patient.id === patientId)
    );
    this.setData({ overview, patients, selectedIndex });
    await this.loadPatient(patients[selectedIndex] ? patients[selectedIndex].id : patientId);
  },

  async loadPatient(patientId) {
    const [detail, timeline] = await Promise.all([api.fetchPatient(patientId), api.fetchTimeline(patientId)]);
    api.setCurrentPatientId(detail.patient.id);
    this.present(detail.patient, detail.analysis, timeline);
  },

  present(patient, analysis, timeline) {
    const prompt = analysis && analysis.fusion ? analysis.fusion.riskPrompt : null;
    const riskLevel = prompt ? prompt.riskLevel : patient.riskTier;
    const actions = analysis && analysis.coach ? analysis.coach.actionList : ['完成一次60秒掌腹PPG复测', '补充最近体检报告'];

    this.setData({
      loading: false,
      patient,
      analysis,
      riskLevel,
      riskText: format.riskText(riskLevel),
      riskScore: prompt ? prompt.riskScore : patient.riskTier === 'high' ? 72 : patient.riskTier === 'medium' ? 52 : 25,
      vascularAgeDelta: prompt ? prompt.vascularAgeDelta : Math.max(0, patient.baseline.vascularAge - patient.age),
      summary: prompt ? prompt.summary : '待运行智能体后生成融合风险摘要。',
      metrics: [
        { label: '在管用户', value: this.data.overview.users, unit: '人' },
        { label: '高风险队列', value: this.data.overview.highRisk, unit: '人' },
        { label: '连接设备', value: this.data.overview.monitoredDevices, unit: '台' },
        { label: '活跃智能体', value: this.data.overview.activeAgents, unit: '个' }
      ],
      vitals: [
        { label: '心率', value: patient.latest.heartRate, unit: 'bpm' },
        { label: 'HRV', value: patient.latest.hrv, unit: 'ms' },
        { label: '血氧', value: patient.latest.spo2, unit: '%' },
        { label: '血压', value: `${patient.latest.systolic}/${patient.latest.diastolic}`, unit: 'mmHg' }
      ],
      trendRows: timeline.map((item) => ({
        ...item,
        riskWidth: `${Math.min(100, item.risk)}%`,
        hrvWidth: `${Math.min(100, item.hrv * 2)}%`
      })),
      actions
    });
  },

  onPatientChange(event) {
    const selectedIndex = Number(event.detail.value);
    const patient = this.data.patients[selectedIndex];
    if (!patient) return;
    this.setData({ selectedIndex, loading: true });
    api.setCurrentPatientId(patient.id);
    this.loadPatient(patient.id);
  },

  async handleRunAnalysis() {
    if (!this.data.patient) return;
    wx.showLoading({ title: '分析中' });
    const analysis = await api.runAnalysis(this.data.patient);
    wx.hideLoading();
    this.present(this.data.patient, analysis, this.data.trendRows);
    wx.showToast({ title: '智能体已完成', icon: 'success' });
  },

  goEmergency() {
    wx.switchTab({ url: '/pages/emergency/emergency' });
  }
});
