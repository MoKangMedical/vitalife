App({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:8787',
    selectedPatientId: 'p-1001',
    lastAnalysis: null,
    lastEmergency: null,
    lastWeRunEvent: null,
    lastHealthKitEvent: null
  },

  onLaunch() {
    wx.setStorageSync('vitalife:lastLaunchAt', new Date().toISOString());
  }
});
