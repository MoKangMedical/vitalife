import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import { runAnalysis } from './agents/orchestrator.js';
import { capabilityModel } from './data/capabilities.js';
import {
  addMemoryEvent,
  getAnalysis,
  getMemory,
  getPatient,
  getTimeline,
  listAgentBuilds,
  listDeviceEvents,
  listEmergencies,
  listPatients,
  listReportCards,
  saveAnalysis,
  saveAgentBuild,
  saveDeviceEvent,
  saveEmergency,
  saveReportCard
} from './data/store.js';
import { createHealthKitDeviceEvent, healthKitPipeline } from './integrations/healthKit.js';
import { createWechatSession, createWeRunDeviceEvent, decryptWeRunPayload } from './integrations/wechat.js';

const app = express();
const port = Number(process.env.VITALIFE_API_PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const composeAgentSchema = z.object({
  templateId: z.string(),
  skillIds: z.array(z.string()).optional(),
  tenant: z.string().optional(),
  channel: z.string().optional()
});

const reportCardSchema = z.object({
  patientId: z.string(),
  cardCode: z.string().optional(),
  channel: z.string().optional()
});

const deviceSyncSchema = z.object({
  patientId: z.string(),
  deviceType: z.string().optional(),
  readings: z.record(z.string(), z.number()).optional()
});

const wechatSessionSchema = z.object({
  code: z.string().min(1)
});

const weRunStepSchema = z.object({
  timestamp: z.number(),
  step: z.number()
});

const weRunSyncSchema = z
  .object({
    patientId: z.string(),
    sessionId: z.string().optional(),
    encryptedData: z.string().optional(),
    iv: z.string().optional(),
    stepInfoList: z.array(weRunStepSchema).optional()
  })
  .superRefine((payload, context) => {
    if (payload.stepInfoList?.length) return;
    if (payload.sessionId && payload.encryptedData && payload.iv) return;
    context.addIssue({
      code: 'custom',
      message: '需要提供 stepInfoList，或提供 sessionId + encryptedData + iv 由服务端解密。'
    });
  });

const healthKitSampleSchema = z.object({
  type: z.string().min(1),
  value: z.number(),
  unit: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  sourceDevice: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const healthKitSyncSchema = z.object({
  patientId: z.string(),
  authorization: z
    .object({
      providerUserId: z.string().optional(),
      scopes: z.array(z.string()).optional(),
      consentAt: z.string().optional()
    })
    .optional(),
  samples: z.array(healthKitSampleSchema).min(1)
});

const memoryEventSchema = z.object({
  type: z.string().optional(),
  summary: z.string().min(1),
  source: z.string().optional()
});

function skillKey(value) {
  return String(value || '').trim();
}

function resolveTemplate(templateId) {
  return capabilityModel.agentTemplates.find((template) => template.id === templateId);
}

function resolveSkill(value, index = 0) {
  const key = skillKey(value);
  const skill = capabilityModel.skills.find((item) => item.id === key || item.name === key);
  if (skill) return skill;
  return {
    id: `template-skill-${index + 1}`,
    name: key,
    category: '模板内置',
    description: `${key} 能力由企业模板工作流在运行时注入，并进入审计链。`,
    inputs: ['租户配置', '用户授权', '场景策略'],
    outputs: ['任务节点', '运营工单', '审计记录']
  };
}

function composeAgentBuild(payload) {
  const template = resolveTemplate(payload.templateId);
  if (!template) return null;

  const selectedSkillKeys = payload.skillIds?.length ? payload.skillIds : template.skills;
  const skills = selectedSkillKeys.map((key, index) => resolveSkill(key, index));
  const tenant = payload.tenant?.trim() || 'Vitalife Sandbox';
  const channel = payload.channel?.trim() || 'web_console';
  const id = `agent-build-${Date.now()}`;

  return {
    id,
    tenant,
    channel,
    status: 'ready_for_sandbox',
    createdAt: new Date().toISOString(),
    template: {
      id: template.id,
      name: template.name,
      scenario: template.scenario,
      outcome: template.outcome
    },
    skills,
    workflow: [
      { step: '01', name: '租户与场景配置', detail: `加载 ${tenant} 的授权、服务包与渠道策略。` },
      { step: '02', name: 'Skill装配', detail: `装配 ${skills.map((skill) => skill.name).join('、')}。` },
      { step: '03', name: 'MIMO多模态接入', detail: '接入报告、体征、症状、长期记忆和设备流。' },
      { step: '04', name: '证据研究链', detail: '生成可复核 RiskPrompt、证据摘要和医生复核要点。' },
      { step: '05', name: '发布到沙盒', detail: '输出企业API、运营台工单和小程序任务入口。' }
    ],
    riskControls: ['非诊断性健康管理输出', '高风险结果进入医生复核队列', '用户授权与审计日志必填', '急性风险只触发提醒和转人工流程'],
    endpoints: {
      invocation: `/api/analysis/run?agentBuildId=${id}`,
      memory: '/api/patients/:id/memory',
      audit: `/api/agent-os/builds/${id}/audit`
    }
  };
}

function redeemReportCard(patient, payload) {
  const cardCode = payload.cardCode?.trim() || `VITA-${patient.id.toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const card = {
    id: `report-card-${Date.now()}`,
    cardCode,
    patientId: patient.id,
    patientName: patient.name,
    channel: payload.channel?.trim() || 'wechat_miniprogram',
    status: 'redeemed',
    redeemedAt: new Date().toISOString(),
    packageName: 'Vitalife 体检报告解读卡',
    summary: `${patient.name} 已兑换报告解读卡，系统将把体检OCR、基线体征和长期记忆合并生成健康摘要。`,
    tasks: ['上传体检报告或拍照页', '确认OCR关键字段', '完成一次60秒PPG复测', '生成家属可读摘要', '写入Vitalife MemOS'],
    outputs: ['结构化指标', '风险分层摘要', '复测任务', '医生复核要点']
  };

  saveReportCard(card);
  addMemoryEvent(patient.id, {
    id: `memory-card-${card.id}`,
    type: 'report_card',
    summary: `报告卡 ${cardCode} 已兑换，进入报告解读与复测任务闭环。`,
    source: 'report_card'
  });
  return card;
}

function syncDeviceEvent(patient, payload) {
  const readings = {
    heartRate: patient.latest.heartRate,
    hrv: patient.latest.hrv,
    spo2: patient.latest.spo2,
    systolic: patient.latest.systolic,
    diastolic: patient.latest.diastolic,
    ...(payload.readings ?? {})
  };
  const riskFlags = [];
  if (readings.systolic >= 140 || readings.diastolic >= 90) riskFlags.push('血压高于家庭监测阈值');
  if (readings.heartRate >= 100) riskFlags.push('心率偏快');
  if (readings.hrv <= 20) riskFlags.push('HRV低于恢复基线');
  if (readings.spo2 < 95) riskFlags.push('血氧需复测');

  const event = {
    id: `device-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    deviceType: payload.deviceType?.trim() || 'home_bp_monitor',
    createdAt: new Date().toISOString(),
    readings,
    quality: {
      completeness: 0.94,
      signalToNoise: readings.spo2 < 92 ? 0.82 : 0.91,
      motionArtifact: 0.06
    },
    riskFlags,
    tasks: riskFlags.length
      ? ['提醒用户静坐5分钟后复测', '同步照护者查看趋势', '必要时进入医生复核队列']
      : ['写入长期体征趋势', '维持下次例行复测提醒']
  };

  saveDeviceEvent(event);
  addMemoryEvent(patient.id, {
    id: `memory-device-${event.id}`,
    type: 'device_sync',
    summary: `${event.deviceType} 已同步：${readings.heartRate}bpm，${readings.systolic}/${readings.diastolic}mmHg，SpO2 ${readings.spo2}%。`,
    source: 'device_gateway'
  });
  return event;
}

function syncWeRunEvent(patient, payload) {
  let stepInfoList = payload.stepInfoList;
  let metadata = { ingestionMode: stepInfoList?.length ? 'plain_step_info' : 'server_decrypted' };

  if (!stepInfoList?.length) {
    const decrypted = decryptWeRunPayload(payload);
    stepInfoList = decrypted.payload.stepInfoList;
    metadata = {
      ingestionMode: 'server_decrypted',
      openIdMasked: decrypted.session.openIdMasked
    };
  }

  const event = createWeRunDeviceEvent(patient, stepInfoList, metadata);
  saveDeviceEvent(event);
  addMemoryEvent(patient.id, {
    id: `memory-werun-${event.id}`,
    type: 'activity_sync',
    summary: `微信运动已同步：今日 ${event.readings.stepsToday} 步，7日均值 ${event.readings.steps7dAvg} 步，活动天数 ${event.readings.activeDays7}/7。`,
    source: 'wechat_werun'
  });
  return event;
}

function syncHealthKitEvent(patient, payload) {
  const event = createHealthKitDeviceEvent(patient, payload);
  saveDeviceEvent(event);
  addMemoryEvent(patient.id, {
    id: `memory-healthkit-${event.id}`,
    type: 'enhanced_device_sync',
    summary: `华为 Health Kit 增强数据已入库：${Object.keys(event.readings).join('、')}，样本数 ${event.source.recordCount}。`,
    source: 'huawei_health_kit'
  });
  return event;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vitalife-api', timestamp: new Date().toISOString() });
});

app.get('/api/platform/overview', (_req, res) => {
  const patients = listPatients();
  res.json({
    users: patients.length,
    highRisk: patients.filter((patient) => patient.riskTier === 'high').length,
    monitoredDevices: 18,
    activeAgents: 9 + listAgentBuilds().length,
    reusableSkills: capabilityModel.skills.length,
    agentTemplates: capabilityModel.agentTemplates.length,
    emergencyEvents: listEmergencies().length,
    modules: ['MIMO底座', 'Vitalife MemOS', '证据研究链', 'Agent OS', 'Skill市场', '采集终端', '质量控制', '专家智能体', '证据图谱', '融合仲裁', '交互闭环']
  });
});

app.get('/api/platform/capabilities', (_req, res) => {
  res.json(capabilityModel);
});

app.get('/api/agent-os/skills', (_req, res) => {
  res.json({ skills: capabilityModel.skills });
});

app.get('/api/agent-os/templates', (_req, res) => {
  res.json({ templates: capabilityModel.agentTemplates });
});

app.get('/api/agent-os/builds', (_req, res) => {
  res.json({ builds: listAgentBuilds() });
});

app.get('/api/agent-os/builds/:id/audit', (req, res) => {
  const build = listAgentBuilds().find((item) => item.id === req.params.id);
  if (!build) return res.status(404).json({ error: 'build_not_found' });
  res.json({
    audit: {
      buildId: build.id,
      status: build.status,
      tenant: build.tenant,
      createdAt: build.createdAt,
      workflow: build.workflow,
      riskControls: build.riskControls,
      logs: build.workflow.map((step) => ({
        step: step.step,
        status: 'passed',
        message: `${step.name} 已完成沙盒审计。`
      }))
    }
  });
});

app.post('/api/agent-os/compose', (req, res) => {
  const parsed = composeAgentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  const build = composeAgentBuild(parsed.data);
  if (!build) return res.status(404).json({ error: 'template_not_found' });

  res.json({ build: saveAgentBuild(build) });
});

app.get('/api/report-cards', (req, res) => {
  res.json({ cards: listReportCards(req.query.patientId ? String(req.query.patientId) : undefined) });
});

app.post('/api/report-cards/redeem', (req, res) => {
  const parsed = reportCardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  const patient = getPatient(parsed.data.patientId);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });

  res.json({ card: redeemReportCard(patient, parsed.data), memory: getMemory(patient.id) });
});

app.post('/api/integrations/wechat/session', async (req, res) => {
  const parsed = wechatSessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  try {
    const result = await createWechatSession(parsed.data.code);
    if (!result.configured) {
      return res.status(503).json({ error: result.error, message: result.message });
    }
    res.json(result);
  } catch (error) {
    res.status(502).json({ error: 'wechat_code2session_failed', message: error.message });
  }
});

app.get('/api/devices/events', (req, res) => {
  res.json({ events: listDeviceEvents(req.query.patientId ? String(req.query.patientId) : undefined) });
});

app.post('/api/devices/sync', (req, res) => {
  const parsed = deviceSyncSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  const patient = getPatient(parsed.data.patientId);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });

  const event = syncDeviceEvent(patient, parsed.data);
  const analysis = saveAnalysis(
    patient.id,
    runAnalysis(patient, {
      signal: event.readings,
      quality: { signal: event.quality }
    })
  );
  res.json({ event, analysis, memory: getMemory(patient.id) });
});

app.post('/api/devices/wechat-werun/sync', (req, res) => {
  const parsed = weRunSyncSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  const patient = getPatient(parsed.data.patientId);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });

  try {
    const event = syncWeRunEvent(patient, parsed.data);
    const analysis = saveAnalysis(
      patient.id,
      runAnalysis(patient, {
        signal: {
          ...patient.latest,
          steps: event.readings.stepsToday,
          steps7dAvg: event.readings.steps7dAvg
        },
        quality: { signal: event.quality }
      })
    );
    res.json({ event, analysis, memory: getMemory(patient.id) });
  } catch (error) {
    res.status(400).json({ error: 'wechat_werun_sync_failed', message: error.message });
  }
});

app.get('/api/integrations/health-kit/pipeline', (_req, res) => {
  res.json({ pipeline: healthKitPipeline });
});

app.post('/api/devices/huawei-health/sync', (req, res) => {
  const parsed = healthKitSyncSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  const patient = getPatient(parsed.data.patientId);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });

  try {
    const event = syncHealthKitEvent(patient, parsed.data);
    const analysis = saveAnalysis(
      patient.id,
      runAnalysis(patient, {
        signal: {
          ...patient.latest,
          ...event.readings
        },
        quality: { signal: event.quality }
      })
    );
    res.json({ event, analysis, memory: getMemory(patient.id), pipeline: healthKitPipeline });
  } catch (error) {
    res.status(400).json({ error: 'huawei_health_sync_failed', message: error.message });
  }
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

app.get('/api/patients/:id/memory', (req, res) => {
  const memory = getMemory(req.params.id);
  if (!memory) return res.status(404).json({ error: 'patient_not_found' });
  res.json({ memory });
});

app.post('/api/patients/:id/memory', (req, res) => {
  const patient = getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });

  const parsed = memoryEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });

  const event = addMemoryEvent(patient.id, {
    type: parsed.data.type ?? 'note',
    summary: parsed.data.summary,
    source: parsed.data.source ?? 'manual_note'
  });
  res.json({ event, memory: getMemory(patient.id) });
});

app.get('/api/patients/:id/report-cards', (req, res) => {
  const patient = getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });
  res.json({ cards: listReportCards(patient.id) });
});

app.get('/api/patients/:id/device-events', (req, res) => {
  const patient = getPatient(req.params.id);
  if (!patient) return res.status(404).json({ error: 'patient_not_found' });
  res.json({ events: listDeviceEvents(patient.id) });
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
