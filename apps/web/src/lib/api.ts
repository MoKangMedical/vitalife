import {
  buildMockAgentBuild,
  buildMockAnalysis,
  buildMockDeviceEvent,
  buildMockEmergency,
  buildMockMemory,
  buildMockReportCard,
  mockCapabilities,
  mockOverview,
  mockPatients,
  mockTimeline
} from './mock';
import type { AgentBuild, Analysis, CapabilityModel, DeviceEvent, EmergencyEvent, Overview, Patient, PatientMemory, ReportCard, TimelinePoint } from './types';

const isStaticPagesHost = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';
const USE_STATIC_MOCKS = isStaticPagesHost && !import.meta.env.VITE_API_BASE_URL;

async function getJson<T>(path: string): Promise<T> {
  if (USE_STATIC_MOCKS) {
    throw new Error('Static GitHub Pages build uses local demo data');
  }
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (USE_STATIC_MOCKS) {
    throw new Error('Static GitHub Pages build uses local demo data');
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchOverview(): Promise<Overview> {
  try {
    return await getJson<Overview>('/api/platform/overview');
  } catch {
    return mockOverview;
  }
}

export async function fetchCapabilities(): Promise<CapabilityModel> {
  try {
    return await getJson<CapabilityModel>('/api/platform/capabilities');
  } catch {
    return mockCapabilities;
  }
}

export async function fetchPatients(): Promise<Patient[]> {
  try {
    const data = await getJson<{ patients: Patient[] }>('/api/patients');
    return data.patients;
  } catch {
    return mockPatients;
  }
}

export async function fetchPatient(patientId: string): Promise<{ patient: Patient; analysis: Analysis | null }> {
  try {
    return await getJson<{ patient: Patient; analysis: Analysis | null }>(`/api/patients/${patientId}`);
  } catch {
    const patient = mockPatients.find((item) => item.id === patientId) ?? mockPatients[0];
    return { patient, analysis: buildMockAnalysis(patient) };
  }
}

export async function fetchTimeline(patientId: string): Promise<TimelinePoint[]> {
  try {
    const data = await getJson<{ series: TimelinePoint[] }>(`/api/patients/${patientId}/timeline`);
    return data.series;
  } catch {
    return mockTimeline;
  }
}

export async function fetchPatientMemory(patient: Patient): Promise<PatientMemory> {
  try {
    const data = await getJson<{ memory: PatientMemory }>(`/api/patients/${patient.id}/memory`);
    return data.memory;
  } catch {
    return buildMockMemory(patient);
  }
}

export async function composeAgent(
  templateId: string,
  skillIds: string[],
  tenant = 'Vitalife Sandbox',
  channel = 'web_console'
): Promise<AgentBuild> {
  try {
    const data = await postJson<{ build: AgentBuild }>('/api/agent-os/compose', {
      templateId,
      skillIds,
      tenant,
      channel
    });
    return data.build;
  } catch {
    return buildMockAgentBuild(templateId, skillIds, tenant, channel);
  }
}

export async function redeemReportCard(patient: Patient, cardCode = 'VITA-DEMO-2026', channel = 'wechat_miniprogram'): Promise<ReportCard> {
  try {
    const data = await postJson<{ card: ReportCard }>('/api/report-cards/redeem', {
      patientId: patient.id,
      cardCode,
      channel
    });
    return data.card;
  } catch {
    return buildMockReportCard(patient, cardCode, channel);
  }
}

export async function syncDevice(patient: Patient): Promise<{ event: DeviceEvent; analysis: Analysis }> {
  const readings = {
    heartRate: patient.latest.heartRate,
    hrv: patient.latest.hrv,
    spo2: patient.latest.spo2,
    systolic: patient.latest.systolic,
    diastolic: patient.latest.diastolic
  };

  try {
    const data = await postJson<{ event: DeviceEvent; analysis: Analysis }>('/api/devices/sync', {
      patientId: patient.id,
      deviceType: 'home_bp_monitor',
      readings
    });
    return data;
  } catch {
    return { event: buildMockDeviceEvent(patient), analysis: buildMockAnalysis(patient) };
  }
}

export async function runAnalysis(patient: Patient): Promise<Analysis> {
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
      treatedBp: patient.conditions.some((condition) => condition.includes('高血压')),
      smoker: false,
      diabetes: patient.riskTier === 'high'
    },
    genomic: {
      prs: patient.riskTier === 'high' ? 0.82 : patient.riskTier === 'medium' ? 0.58 : 0.26
    },
    quality: {
      face: { illumination: 0.88, roiIntegrity: 0.92, blur: 0.12 },
      signal: { signalToNoise: 0.9, motionArtifact: 0.07 },
      report: { ocrConfidence: 0.84, fieldCompleteness: 0.79 },
      genomic: { coverage: 0.93, sampleIntegrity: 0.9 }
    }
  };

  try {
    const data = await postJson<{ analysis: Analysis }>('/api/analysis/run', payload);
    return data.analysis;
  } catch {
    return buildMockAnalysis(patient);
  }
}

export async function simulateEmergency(patientId: string, patient: Patient): Promise<{ event: EmergencyEvent; analysis: Analysis }> {
  try {
    return await postJson<{ event: EmergencyEvent; analysis: Analysis }>('/api/emergency/simulate', { patientId });
  } catch {
    return { event: buildMockEmergency(patient), analysis: buildMockAnalysis(patient) };
  }
}
