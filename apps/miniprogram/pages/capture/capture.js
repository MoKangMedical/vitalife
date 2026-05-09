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
    this.setData({
      patient,
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
  }
});
