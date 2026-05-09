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
      glucose: patient.riskTier === 'high' ? 6.4 : 5.3,
      crp: patient.riskTier === 'low' ? 1.2 : 2.8
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
  fetchCapabilities,
  fetchOverview,
  fetchPatient,
  fetchPatients,
  fetchTimeline,
  runAnalysis,
  setCurrentPatientId,
  simulateEmergency
};
