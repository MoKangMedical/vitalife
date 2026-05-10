const mock = require('./mock');

const app = () => getApp();

function request(path, options = {}) {
  const baseUrl = app().globalData.apiBaseUrl;
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${path}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json'
      },
      timeout: 5000,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        reject(new Error(`HTTP ${response.statusCode}`));
      },
      fail(error) {
        reject(error);
      }
    });
  });
}

function currentPatientId() {
  return app().globalData.selectedPatientId || 'p-1001';
}

function setCurrentPatientId(patientId) {
  app().globalData.selectedPatientId = patientId;
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    if (!wx.login) {
      reject(new Error('wx.login unavailable'));
      return;
    }
    wx.login({
      success(result) {
        if (result.code) {
          resolve(result);
          return;
        }
        reject(new Error('wx.login missing code'));
      },
      fail: reject
    });
  });
}

function wxGetWeRunData() {
  return new Promise((resolve, reject) => {
    if (!wx.getWeRunData) {
      reject(new Error('wx.getWeRunData unavailable'));
      return;
    }
    wx.getWeRunData({
      success: resolve,
      fail: reject
    });
  });
}

async function fetchOverview() {
  try {
    return await request('/api/platform/overview');
  } catch (error) {
    return mock.mockOverview();
  }
}

async function fetchCapabilities() {
  try {
    return await request('/api/platform/capabilities');
  } catch (error) {
    return mock.mockCapabilities();
  }
}

async function fetchPatients() {
  try {
    const data = await request('/api/patients');
    return data.patients;
  } catch (error) {
    return mock.patients;
  }
}

async function fetchPatient(patientId = currentPatientId()) {
  try {
    const data = await request(`/api/patients/${patientId}`);
    return data;
  } catch (error) {
    const patient = mock.getPatient(patientId);
    return {
      patient,
      analysis: app().globalData.lastAnalysis || mock.buildMockAnalysis(patient)
    };
  }
}

async function fetchTimeline(patientId = currentPatientId()) {
  try {
    const data = await request(`/api/patients/${patientId}/timeline`);
    return data.series;
  } catch (error) {
    return mock.timeline;
  }
}

async function fetchPatientMemory(patientId = currentPatientId()) {
  try {
    const data = await request(`/api/patients/${patientId}/memory`);
    return data.memory;
  } catch (error) {
    return mock.buildMockMemory(mock.getPatient(patientId));
  }
}

async function composeAgent(templateId, skillIds, tenant = 'Vitalife Sandbox', channel = 'wechat_miniprogram') {
  try {
    const data = await request('/api/agent-os/compose', {
      method: 'POST',
      data: {
        templateId,
        skillIds,
        tenant,
        channel
      }
    });
    app().globalData.lastAgentBuild = data.build;
    return data.build;
  } catch (error) {
    const build = mock.buildMockAgentBuild(templateId, skillIds, tenant, channel);
    app().globalData.lastAgentBuild = build;
    return build;
  }
}

async function redeemReportCard(patient) {
  try {
    const data = await request('/api/report-cards/redeem', {
      method: 'POST',
      data: {
        patientId: patient.id,
        cardCode: `VITA-${patient.id.toUpperCase()}-2026`,
        channel: 'wechat_miniprogram'
      }
    });
    app().globalData.lastReportCard = data.card;
    return data.card;
  } catch (error) {
    const card = mock.buildMockReportCard(patient, `VITA-${patient.id.toUpperCase()}-2026`);
    app().globalData.lastReportCard = card;
    return card;
  }
}

async function syncDevice(patient) {
  const readings = {
    heartRate: patient.latest.heartRate,
    hrv: patient.latest.hrv,
    spo2: patient.latest.spo2,
    systolic: patient.latest.systolic,
    diastolic: patient.latest.diastolic
  };
  try {
    const data = await request('/api/devices/sync', {
      method: 'POST',
      data: {
        patientId: patient.id,
        deviceType: 'home_bp_monitor',
        readings
      }
    });
    app().globalData.lastDeviceEvent = data.event;
    app().globalData.lastAnalysis = data.analysis;
    return data;
  } catch (error) {
    const event = mock.buildMockDeviceEvent(patient);
    const analysis = mock.buildMockAnalysis(patient);
    app().globalData.lastDeviceEvent = event;
    app().globalData.lastAnalysis = analysis;
    return { event, analysis };
  }
}

async function syncWeRun(patient) {
  try {
    const loginResult = await wxLogin();
    const sessionData = await request('/api/integrations/wechat/session', {
      method: 'POST',
      data: {
        code: loginResult.code
      }
    });
    const runData = await wxGetWeRunData();
    const data = await request('/api/devices/wechat-werun/sync', {
      method: 'POST',
      data: {
        patientId: patient.id,
        sessionId: sessionData.session.id,
        encryptedData: runData.encryptedData,
        iv: runData.iv
      }
    });
    app().globalData.lastWeRunEvent = data.event;
    app().globalData.lastAnalysis = data.analysis;
    return data;
  } catch (error) {
    const event = mock.buildMockWeRunDeviceEvent(patient);
    const analysis = mock.buildMockAnalysis(patient);
    app().globalData.lastWeRunEvent = event;
    app().globalData.lastAnalysis = analysis;
    return { event, analysis };
  }
}

async function fetchHealthKitPipeline() {
  try {
    const data = await request('/api/integrations/health-kit/pipeline');
    return data.pipeline;
  } catch (error) {
    return mock.healthKitPipeline;
  }
}

async function syncHealthKitDemo(patient) {
  try {
    const data = await request('/api/devices/huawei-health/sync', {
      method: 'POST',
      data: {
        patientId: patient.id,
        authorization: {
          providerUserId: `huawei-demo-${patient.id}`,
          scopes: ['healthkit.activity', 'healthkit.heart', 'healthkit.sleep', 'healthkit.oxygen_saturation', 'healthkit.blood_pressure'],
          consentAt: new Date().toISOString()
        },
        samples: mock.buildDemoHealthKitSamples(patient)
      }
    });
    app().globalData.lastHealthKitEvent = data.event;
    app().globalData.lastAnalysis = data.analysis;
    return data;
  } catch (error) {
    const event = mock.buildMockHealthKitDeviceEvent(patient);
    const analysis = mock.buildMockAnalysis(patient);
    app().globalData.lastHealthKitEvent = event;
    app().globalData.lastAnalysis = analysis;
    return { event, analysis, pipeline: mock.healthKitPipeline };
  }
}

async function runAnalysis(patient) {
  const payload = {
    patientId: patient.id,
    face: {
      faceAge: patient.baseline.faceAge,
      cadRisk: patient.baseline.cadRisk
    },
    signal: {
      heartRate: patient.latest.heartRate,
      hrv: patient.latest.hrv,
      spo2: patient.latest.spo2,
      systolic: patient.latest.systolic,
      diastolic: patient.latest.diastolic
    },
    report: {
      ldl: patient.riskTier === 'high' ? 4.2 : patient.riskTier === 'medium' ? 3.4 : 2.7,
      totalCholesterolMgDl: patient.riskTier === 'high' ? 238 : patient.riskTier === 'medium' ? 212 : 178,
      hdlMgDl: patient.riskTier === 'high' ? 42 : patient.riskTier === 'medium' ? 48 : 58,
      glucose: patient.riskTier === 'high' ? 6.4 : 5.3,
      hba1c: patient.riskTier === 'high' ? 6.2 : patient.riskTier === 'medium' ? 5.8 : 5.3,
      crp: patient.riskTier === 'low' ? 1.2 : 2.8,
      treatedBp: patient.conditions.some((condition) => condition.indexOf('高血压') >= 0),
      smoker: false,
      diabetes: patient.riskTier === 'high'
    },
    genomic: {
      prs: patient.riskTier === 'high' ? 0.82 : patient.riskTier === 'medium' ? 0.58 : 0.26
    },
    quality: {
      face: { completeness: 0.92, signalToNoise: 0.86, motionArtifact: 0.08 },
      signal: { completeness: 0.9, signalToNoise: 0.9, motionArtifact: 0.07 },
      report: { completeness: 0.82, signalToNoise: 0.78, motionArtifact: 0.1 },
      genomic: { completeness: 0.93, signalToNoise: 0.9, motionArtifact: 0.05 }
    }
  };

  try {
    const data = await request('/api/analysis/run', {
      method: 'POST',
      data: payload
    });
    app().globalData.lastAnalysis = data.analysis;
    return data.analysis;
  } catch (error) {
    const analysis = mock.buildMockAnalysis(patient);
    app().globalData.lastAnalysis = analysis;
    return analysis;
  }
}

async function simulateEmergency(patient) {
  try {
    const data = await request('/api/emergency/simulate', {
      method: 'POST',
      data: {
        patientId: patient.id
      }
    });
    app().globalData.lastAnalysis = data.analysis;
    app().globalData.lastEmergency = data.event;
    return data;
  } catch (error) {
    const data = mock.buildMockEmergency(patient);
    app().globalData.lastAnalysis = data.analysis;
    app().globalData.lastEmergency = data.event;
    return data;
  }
}

module.exports = {
  currentPatientId,
  composeAgent,
  fetchCapabilities,
  fetchOverview,
  fetchHealthKitPipeline,
  fetchPatient,
  fetchPatientMemory,
  fetchPatients,
  fetchTimeline,
  redeemReportCard,
  runAnalysis,
  setCurrentPatientId,
  simulateEmergency,
  syncDevice,
  syncHealthKitDemo,
  syncWeRun
};
