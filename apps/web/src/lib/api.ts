import { buildMockAnalysis, buildMockEmergency, mockOverview, mockPatients, mockTimeline } from './mock';
import type { Analysis, EmergencyEvent, Overview, Patient, TimelinePoint } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
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
      glucose: patient.riskTier === 'high' ? 6.4 : 5.3,
      crp: patient.riskTier === 'low' ? 1.2 : 2.8
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
