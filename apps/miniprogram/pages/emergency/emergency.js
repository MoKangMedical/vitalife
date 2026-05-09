const api = require('../../utils/api');
const format = require('../../utils/format');

Page({
  data: {
    patient: null,
    event: null,
    riskLevel: 'medium',
    riskText: '未触发',
    riskScore: '--',
    eventStatus: 'standby',
    summary: '当前无急性事件窗口，可运行演练验证通知链路。',
    vitals: [
      { label: '模拟心率', value: 148, unit: 'bpm' },
      { label: '模拟HRV', value: 9, unit: 'ms' },
      { label: '模拟血氧', value: 88, unit: '%' }
    ],
    chain: []
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const detail = await api.fetchPatient();
    const patient = detail.patient;
    const event = getApp().globalData.lastEmergency;
    this.present(patient, event);
  },

  present(patient, event) {
    const prompt = event ? event.riskPrompt : null;
    this.setData({
      patient,
      event,
      riskLevel: prompt ? prompt.riskLevel : 'medium',
      riskText: prompt ? format.riskText(prompt.riskLevel) : '待演练',
      riskScore: prompt ? prompt.riskScore : '--',
      eventStatus: event ? event.status : 'standby',
      summary: prompt ? prompt.summary : `${patient.name} 当前无急性事件窗口，可运行演练验证通知链路。`,
      chain: [
        { title: '端侧强提醒', desc: '震动、铃声、屏幕确认按钮', done: Boolean(prompt) },
        { title: '30秒无响应升级', desc: `通知${patient.caregiver} ${patient.phoneMasked}`, done: Boolean(event) },
        { title: '证据摘要写入日志', desc: 'HR、SpO2、PPG窗口与RiskPrompt', done: Boolean(event) },
        { title: '医生台复核', desc: '运营台生成急性事件工单', done: false }
      ]
    });
  },

  async simulate() {
    if (!this.data.patient) return;
    wx.showLoading({ title: '急救演练' });
    const data = await api.simulateEmergency(this.data.patient);
    wx.hideLoading();
    this.present(this.data.patient, data.event);
    wx.showToast({ title: '已触发预警', icon: 'success' });
  }
});
