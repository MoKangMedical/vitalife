const api = require('../../utils/api');
const format = require('../../utils/format');

Page({
  data: {
    patient: null,
    analysis: null,
    riskLevel: 'medium',
    riskText: '待评估',
    riskScore: '--',
    vascularAgeDelta: '--',
    summary: '请先运行智能体分析，生成本次融合结论。',
    actions: [],
    trendRows: [],
    operations: [
      { title: '医生复核', desc: '高风险与急性预警报告需人工确认' },
      { title: '家属同步', desc: '发送摘要、复测任务和紧急联系人状态' },
      { title: '导出归档', desc: '生成PDF并写入审计日志' }
    ]
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const [detail, timeline] = await Promise.all([api.fetchPatient(), api.fetchTimeline()]);
    const patient = detail.patient;
    const analysis = getApp().globalData.lastAnalysis || detail.analysis;
    const prompt = analysis && analysis.fusion ? analysis.fusion.riskPrompt : null;

    this.setData({
      patient,
      analysis,
      riskLevel: prompt ? prompt.riskLevel : patient.riskTier,
      riskText: format.riskText(prompt ? prompt.riskLevel : patient.riskTier),
      riskScore: prompt ? prompt.riskScore : '--',
      vascularAgeDelta: prompt ? `+${prompt.vascularAgeDelta}岁` : '--',
      summary: prompt ? prompt.summary : '请先运行智能体分析，生成本次融合结论。',
      actions: analysis && analysis.coach ? analysis.coach.actionList : ['运行智能体分析', '完成PPG复测', '补充体检报告'],
      trendRows: timeline.map((item) => ({
        ...item,
        riskWidth: `${Math.min(100, item.risk)}%`
      }))
    });
  },

  markReview() {
    wx.showToast({ title: '已加入复核队列', icon: 'success' });
  },

  goAgents() {
    wx.switchTab({ url: '/pages/agents/agents' });
  }
});
