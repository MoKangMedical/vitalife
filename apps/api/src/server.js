import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import { runAnalysis } from './agents/orchestrator.js';
import {
  getAnalysis,
  getPatient,
  getTimeline,
  listEmergencies,
  listPatients,
  saveAnalysis,
  saveEmergency
} from './data/store.js';

const app = express();
const port = Number(process.env.VITALIFE_API_PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vitalife-api', timestamp: new Date().toISOString() });
});

app.get('/api/platform/overview', (_req, res) => {
  const patients = listPatients();
  res.json({
    users: patients.length,
    highRisk: patients.filter((patient) => patient.riskTier === 'high').length,
    monitoredDevices: 18,
    activeAgents: 5,
    emergencyEvents: listEmergencies().length,
    modules: ['采集终端', '质量控制', '专家智能体', '证据图谱', '融合仲裁', '交互闭环']
  });
});

app.get('/api/patients', (_req, res) => {
  res.json({ patients: listPatients() });
});

app.get('/api/patients/:id', (req, res) => {
  const patient = getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });
  res.json({ patient, analysis: getAnalysis(patient.id) ?? null });
});

app.get('/api/patients/:id/timeline', (req, res) => {
  const patient = getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });
  res.json({ series: getTimeline(patient.id) });
});

const analysisSchema = z.object({
  patientId: z.string(),
  face: z.record(z.string(), z.unknown()).optional(),
  signal: z.record(z.string(), z.unknown()).optional(),
  report: z.record(z.string(), z.unknown()).optional(),
  genomic: z.record(z.string(), z.unknown()).optional(),
  quality: z.record(z.string(), z.record(z.string(), z.number()).optional()).optional()
});

app.post('/api/analysis/run', (req, res) => {
  const parsed = analysisSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });
  const patient = getPatient(parsed.data.patientId);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });
  const analysis = saveAnalysis(patient.id, runAnalysis(patient, parsed.data));
  res.json({ analysis });
});

app.post('/api/emergency/simulate', (req, res) => {
  const patientId = String(req.body?.patientId || 'p-1002');
  const patient = getPatient(patientId);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });
  const analysis = runAnalysis(patient, {
    signal: { heartRate: 148, hrv: 9, spo2: 88 },
    quality: { signal: { signalToNoise: 0.91, motionArtifact: 0.05 } }
  });
  const event = saveEmergency({
    id: `emergency-${Date.now()}`,
    patientId,
    patientName: patient.name,
    createdAt: new Date().toISOString(),
    status: 'pending_confirmation',
    riskPrompt: analysis.fusion.riskPrompt,
    actionList: analysis.coach.actionList
  });
  res.json({ event, analysis });
});

app.use((error, _req, res, _next) => {
  res.status(500).json({ error: 'internal_error', message: error.message });
});

app.listen(port, () => {
  console.log(`Vitalife API listening on http://localhost:${port}`);
});
