const api = require('../../utils/api');

Page({
  data: {
    patient: null,
    progress: 62,
    progressText: '62%',
    capturing: false,
    captureChecks: [
      '人脸居中，额头与面颊区域完整',
      '光照评分 0.88，模糊度 0.12',
      '端侧脱敏后仅上传特征向量'
    ],
    uploads: [],
    reportCard: null,
    deviceEvent: null,
    weRunEvent: null,
    healthKitEvent: null,
    healthKitStages: [],
    memoryEvents: [],
    privacy: ['生物特征本地预处理', '证据摘要进入审计日志', '老人端、家属端、医生端权限隔离']
  },

  onLoad() {
    this.loadPatient();
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  async loadPatient() {
    const detail = await api.fetchPatient();
    const patient = detail.patient;
    const memory = await api.fetchPatientMemory(patient.id);
    const healthKitPipeline = await api.fetchHealthKitPipeline();
    this.setData({
      patient,
      memoryEvents: memory.events.slice(0, 4),
      healthKitStages: healthKitPipeline.stages || [],
      uploads: [
        { title: '体检报告OCR', desc: 'LDL-C、HbA1c、hs-CRP已解析' },
        { title: '基因PRS文件', desc: `${patient.name} 的冠心病PRS可用` },
        { title: '用药与病史', desc: patient.conditions.join(' / ') }
      ]
    });
  },

  startCapture() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.setData({ progress: 0, progressText: '0%', capturing: true });
    this.timer = setInterval(() => {
      const next = Math.min(100, this.data.progress + 8);
      this.setData({ progress: next, progressText: `${next}%` });
      if (next >= 100) {
        clearInterval(this.timer);
        this.timer = null;
        this.setData({ capturing: false });
        wx.showToast({ title: '采集完成', icon: 'success' });
      }
    }, 220);
  },

  async runWindowAnalysis() {
    if (!this.data.patient) return;
    wx.showLoading({ title: '分析窗口' });
    await api.runAnalysis(this.data.patient);
    wx.hideLoading();
    wx.switchTab({ url: '/pages/agents/agents' });
  },

  async redeemCard() {
    if (!this.data.patient) return;
    wx.showLoading({ title: '兑换报告卡' });
    const reportCard = await api.redeemReportCard(this.data.patient);
    const memory = await api.fetchPatientMemory(this.data.patient.id);
    this.setData({ reportCard, memoryEvents: memory.events.slice(0, 4) });
    wx.hideLoading();
    wx.showToast({ title: '已生成任务', icon: 'success' });
  },

  async syncDevice() {
    if (!this.data.patient) return;
    wx.showLoading({ title: '同步设备' });
    const data = await api.syncDevice(this.data.patient);
    const memory = await api.fetchPatientMemory(this.data.patient.id);
    this.setData({ deviceEvent: data.event, memoryEvents: memory.events.slice(0, 4) });
    wx.hideLoading();
    wx.showToast({ title: '已写入记忆', icon: 'success' });
  },

  async syncWeRun() {
    if (!this.data.patient) return;
    wx.showLoading({ title: '同步微信运动' });
    const data = await api.syncWeRun(this.data.patient);
    const memory = await api.fetchPatientMemory(this.data.patient.id);
    this.setData({ weRunEvent: data.event, memoryEvents: memory.events.slice(0, 4) });
    wx.hideLoading();
    wx.showToast({ title: '步数已同步', icon: 'success' });
  },

  async syncHealthKitDemo() {
    if (!this.data.patient) return;
    wx.showLoading({ title: 'Health Kit入库' });
    const data = await api.syncHealthKitDemo(this.data.patient);
    const memory = await api.fetchPatientMemory(this.data.patient.id);
    this.setData({
      healthKitEvent: data.event,
      healthKitStages: (data.pipeline && data.pipeline.stages) || this.data.healthKitStages,
      memoryEvents: memory.events.slice(0, 4)
    });
    wx.hideLoading();
    wx.showToast({ title: '增强样本已入库', icon: 'success' });
  }
});
