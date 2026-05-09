import { patients, weeklySeries, knowledgeSnippets } from './seed.js';

const analyses = new Map();
const emergencyEvents = [];
const agentBuilds = [];
const reportCards = [];
const deviceEvents = [];
const memoryEvents = new Map();

export function listPatients() {
  return patients;
}

export function getPatient(id) {
  return patients.find((patient) => patient.id === id);
}

export function getTimeline(id) {
  return weeklySeries.map((point, index) => ({
    ...point,
    id: `${id}-${index}`,
    timestamp: `2026-05-${String(index + 3).padStart(2, '0')}T08:30:00+08:00`
  }));
}

export function getKnowledgeSnippets() {
  return knowledgeSnippets;
}

export function saveAnalysis(patientId, analysis) {
  analyses.set(patientId, analysis);
  return analysis;
}

export function getAnalysis(patientId) {
  return analyses.get(patientId);
}

export function saveAgentBuild(build) {
  agentBuilds.unshift(build);
  return build;
}

export function listAgentBuilds() {
  return agentBuilds.slice(0, 20);
}

export function saveReportCard(card) {
  reportCards.unshift(card);
  return card;
}

export function listReportCards(patientId) {
  return reportCards.filter((card) => !patientId || card.patientId === patientId).slice(0, 30);
}

export function saveDeviceEvent(event) {
  deviceEvents.unshift(event);
  return event;
}

export function listDeviceEvents(patientId) {
  return deviceEvents.filter((event) => !patientId || event.patientId === patientId).slice(0, 50);
}

export function addMemoryEvent(patientId, event) {
  const current = memoryEvents.get(patientId) ?? [];
  const next = [
    {
      id: event.id ?? `memory-${patientId}-${Date.now()}`,
      patientId,
      createdAt: event.createdAt ?? new Date().toISOString(),
      ...event
    },
    ...current
  ];
  memoryEvents.set(patientId, next.slice(0, 50));
  return next[0];
}

export function getMemory(patientId) {
  const patient = getPatient(patientId);
  if (!patient) return null;

  const latestAnalysis = getAnalysis(patientId);
  const latestTimeline = getTimeline(patientId);
  const baselineEvents = [
    {
      id: `memory-${patientId}-profile`,
      patientId,
      type: 'baseline',
      summary: `${patient.name} 基线包含 ${patient.conditions.join('、')}，当前方案为 ${patient.plan}。`,
      source: 'patient_profile',
      createdAt: patient.latest.updatedAt
    },
    {
      id: `memory-${patientId}-trend`,
      patientId,
      type: 'trend',
      summary: `最近7日风险区间 ${Math.min(...latestTimeline.map((point) => point.risk))}-${Math.max(
        ...latestTimeline.map((point) => point.risk)
      )}，HRV最新值 ${patient.latest.hrv}ms。`,
      source: 'weekly_series',
      createdAt: latestTimeline.at(-1)?.timestamp ?? patient.latest.updatedAt
    }
  ];

  if (latestAnalysis?.fusion?.riskPrompt) {
    baselineEvents.unshift({
      id: `memory-${patientId}-${latestAnalysis.id}`,
      patientId,
      type: 'analysis',
      summary: latestAnalysis.fusion.riskPrompt.summary,
      source: 'agent_fusion',
      createdAt: latestAnalysis.fusion.riskPrompt.generatedAt
    });
  }

  const events = [...(memoryEvents.get(patientId) ?? []), ...baselineEvents].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return {
    patientId,
    profile: {
      patientName: patient.name,
      riskTier: patient.riskTier,
      caregiver: patient.caregiver,
      baseline: patient.baseline,
      latest: patient.latest
    },
    events: events.slice(0, 30),
    summary: {
      baselineRisk: patient.riskTier,
      latestVitals: `${patient.latest.heartRate}bpm / ${patient.latest.systolic}/${patient.latest.diastolic}mmHg / SpO2 ${patient.latest.spo2}%`,
      continuity: `${events.length} 条长期记忆事件可用于个性化解释与复测提醒。`
    }
  };
}

export function saveEmergency(event) {
  emergencyEvents.unshift(event);
  return event;
}

export function listEmergencies() {
  return emergencyEvents.slice(0, 20);
}
