const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    capabilities: null,
    layers: [],
    skills: [],
    templates: [],
    plays: [],
    differentiators: []
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
      differentiators: capabilities.differentiators
    });
  }
});
