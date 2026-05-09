const api = require('../../utils/api');
const format = require('../../utils/format');

Page({
  data: {
    patient: null,
    analysis: null,
    riskLevel: 'medium',
    riskText: '待分析',
    riskScore: '--',
    summary: '运行智能体后生成 RiskPrompt。',
    taskGraph: [],
    qualityRows: [],
    evidenceRows: [],
    graphNodes: [],
    promptJson: ''
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const detail = await api.fetchPatient();
    const patient = detail.patient;
    const analysis = getApp().globalData.lastAnalysis || detail.analysis;
    this.present(patient, analysis);
  },

  present(patient, analysis) {
    if (!analysis) {
      this.setData({
        patient,
        analysis: null,
        taskGraph: [],
        qualityRows: [],
        evidenceRows: [],
        graphNodes: [],
        promptJson: ''
      });
      return;
    }

    const prompt = analysis.fusion.riskPrompt;
    const evidenceRows = [];
    analysis.agentResults.forEach((result) => {
      result.evidence.forEach((evidence) => {
        evidenceRows.push({
          id: `${result.agent}-${evidence.id}`,
          agent: format.agentText(result.agent),
          label: evidence.label,
          explanation: evidence.explanation,
          direction: evidence.direction,
          confidence: format.percent(evidence.confidence)
        });
      });
    });

    this.setData({
      patient,
      analysis,
      riskLevel: prompt.riskLevel,
      riskText: format.riskText(prompt.riskLevel),
      riskScore: prompt.riskScore,
      summary: prompt.summary,
      taskGraph: analysis.taskGraph.map((task) => ({
        ...task,
        statusText: task.status === 'completed' ? '完成' : task.status
      })),
      qualityRows: analysis.qualityVectors.map((quality) => ({
        ...quality,
        label: format.modalityText(quality.modality),
        scoreText: format.percent(quality.score),
        width: `${Math.round(quality.score * 100)}%`,
        flagsText: quality.flags ? quality.flags.join('、') : quality.disposition
      })),
      evidenceRows,
      graphNodes: analysis.fusion.evidenceGraph.nodes.map((node) => ({
        ...node,
        width: `${Math.min(100, Math.round(node.score * 100))}%`,
        scoreText: Number(node.score).toFixed(2)
      })),
      promptJson: JSON.stringify(prompt, null, 2)
    });
  },

  async handleRunAnalysis() {
    const patient = this.data.patient || (await api.fetchPatient()).patient;
    wx.showLoading({ title: '编排中' });
    const analysis = await api.runAnalysis(patient);
    wx.hideLoading();
    this.present(patient, analysis);
    wx.showToast({ title: '分析完成', icon: 'success' });
  },

  goOS() {
    wx.navigateTo({ url: '/pages/os/os' });
  }
});
