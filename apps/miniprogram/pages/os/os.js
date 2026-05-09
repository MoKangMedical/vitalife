const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    capabilities: null,
    layers: [],
    skills: [],
    templates: [],
    plays: [],
    differentiators: [],
    selectedTemplateId: '',
    selectedSkillIds: [],
    agentBuild: null,
    composing: false
  },

  onLoad() {
    this.loadData();
  },

  async loadData() {
    const capabilities = await api.fetchCapabilities();
    this.setData({
      loading: false,
      capabilities,
      layers: capabilities.layers,
      skills: capabilities.skills,
      templates: capabilities.agentTemplates,
      plays: capabilities.commercialPlays,
      differentiators: capabilities.differentiators,
      selectedTemplateId: capabilities.agentTemplates[0] ? capabilities.agentTemplates[0].id : '',
      selectedSkillIds: capabilities.skills.slice(0, 3).map((skill) => skill.id)
    });
  },

  selectTemplate(event) {
    this.setData({
      selectedTemplateId: event.currentTarget.dataset.id
    });
  },

  toggleSkill(event) {
    const id = event.currentTarget.dataset.id;
    const selected = this.data.selectedSkillIds.includes(id)
      ? this.data.selectedSkillIds.filter((item) => item !== id)
      : this.data.selectedSkillIds.concat(id);
    this.setData({ selectedSkillIds: selected });
  },

  async composeAgent() {
    if (!this.data.selectedTemplateId || !this.data.selectedSkillIds.length) return;
    this.setData({ composing: true });
    const build = await api.composeAgent(this.data.selectedTemplateId, this.data.selectedSkillIds, '微信小程序沙盒');
    this.setData({ composing: false, agentBuild: build });
    wx.showToast({ title: 'Agent已生成', icon: 'success' });
  }
});
