import { patients, weeklySeries, knowledgeSnippets } from './seed.js';

const analyses = new Map();
const emergencyEvents = [];

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

export function saveEmergency(event) {
  emergencyEvents.unshift(event);
  return event;
}

export function listEmergencies() {
  return emergencyEvents.slice(0, 20);
}
