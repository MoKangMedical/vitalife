import type {
  AgentBuild,
  Analysis,
  CapabilityModel,
  DeviceEvent,
  EmergencyEvent,
  Overview,
  Patient,
  PatientMemory,
  ReportCard,
  SkillDefinition,
  TimelinePoint
} from './types';

export const mockPatients: Patient[] = [
  {
    id: 'p-1001',
    name: '林女士',
    age: 68,
    sex: 'female',
    plan: 'Family Care',
    riskTier: 'medium',
    caregiver: '张先生',
    phoneMasked: '138****2941',
    conditions: ['高血压', '血脂偏高', '睡眠质量下降'],
    baseline: {
      restingHr: 72,
      hrv: 31,
      vascularAge: 72,
      faceAge: 74,
      cadRisk: 0.36,
      spo2: 97
    },
    latest: {
      heartRate: 86,
      hrv: 24,
      spo2: 96,
      systolic: 142,
      diastolic: 86,
      sleepScore: 68,
      steps: 4820,
      updatedAt: '2026-05-09T08:42:00+08:00'
    }
  },
  {
    id: 'p-1002',
    name: '王先生',
    age: 54,
    sex: 'male',
    plan: 'Pro Prevention',
    riskTier: 'high',
    caregiver: '王女士',
    phoneMasked: '186****9032',
    conditions: ['冠心病家族史', 'LDL-C升高', '压力大'],
    baseline: {
      restingHr: 78,
      hrv: 22,
      vascularAge: 65,
      faceAge: 61,
      cadRisk: 0.58,
      spo2: 96
    },
    latest: {
      heartRate: 96,
      hrv: 18,
      spo2: 95,
      systolic: 151,
      diastolic: 93,
      sleepScore: 55,
      steps: 3180,
      updatedAt: '2026-05-09T08:50:00+08:00'
    }
  },
  {
    id: 'p-1003',
    name: '陈女士',
    age: 43,
    sex: 'female',
    plan: 'Vitalife Premium',
    riskTier: 'low',
    caregiver: '本人',
    phoneMasked: '139****1187',
    conditions: ['亚健康疲劳'],
    baseline: {
      restingHr: 66,
      hrv: 44,
      vascularAge: 42,
      faceAge: 45,
      cadRisk: 0.18,
      spo2: 98
    },
    latest: {
      heartRate: 72,
      hrv: 41,
      spo2: 98,
      systolic: 116,
      diastolic: 74,
      sleepScore: 79,
      steps: 8210,
      updatedAt: '2026-05-09T08:47:00+08:00'
    }
  }
];

export const mockOverview: Overview = {
  users: 3,
  highRisk: 1,
  monitoredDevices: 18,
  activeAgents: 9,
  reusableSkills: 9,
  agentTemplates: 5,
  emergencyEvents: 0,
  modules: ['MIMO底座', 'Vitalife MemOS', '证据研究链', 'Agent OS', 'Skill市场', '采集终端', '质量控制', '专家智能体', '证据图谱', '融合仲裁', '交互闭环']
};

export const mockCapabilities: CapabilityModel = {
  positioning:
    'Vitalife 采用 MIMO API 多模态底座 + C端长期健康陪伴 + B端 Agent OS 开放平台的三层模式，聚焦心血管与抗衰健康管理，并向罕见病筛查和药物发现延伸。',
  layers: [
    {
      id: 'foundation',
      name: '底座层',
      title: 'MIMO Health Foundation',
      summary: '统一接入文本、体检报告、面部视觉、PPG/ECG、家庭设备、基因PRS和症状轨迹，形成可解释的多模态医疗证据底座。',
      modules: ['MIMO API', 'Vitalife MemOS', 'Vitalife Research', '证据图谱', '隐私审计']
    },
    {
      id: 'consumer',
      name: 'C端',
      title: 'Vitalife Companion',
      summary: '面向老人、家属和慢病人群，提供长期健康记忆、报告解读、复测提醒、家庭健康管理和线下体检报告解读卡。',
      modules: ['微信小程序', '体检报告解读卡', '家属端同步', '复测任务', '急救联动']
    },
    {
      id: 'business',
      name: 'B端',
      title: 'Vitalife Agent OS',
      summary: '以 Agent + Skill 的可组装模式开放给医院、保险、药房、体检中心和硬件厂商，支持低代码编排专属健康管理智能体。',
      modules: ['Agent编排', 'Skill市场', '租户配置', '工作流审计', '企业API']
    }
  ],
  foundation: [
    { id: 'mimo-api', name: 'MIMO API 多模态底座', capability: '统一理解文本、影像、报告、体征照片、PPG/ECG、设备数据和基因PRS。', status: 'platform-ready' },
    { id: 'memory', name: 'Vitalife MemOS', capability: '持续记录个人基线、复测窗口、干预响应、家族史和长期风险变化，形成健康时间感。', status: 'prototype' },
    { id: 'research', name: 'Vitalife Research', capability: '对复杂健康问题触发工具调用、证据补全、指南检索、风险解释和推理链留痕。', status: 'prototype' },
    { id: 'evidence-graph', name: '证据图谱与仲裁', capability: '把各专家智能体输出归一化为可解释证据，按质量向量和场景策略进行融合。', status: 'implemented' }
  ],
  skills: [
    { id: 'skill-report-card', name: '体检报告解读卡', category: 'C端获客', description: '把一次AI报告解读物化成线下卡片/兑换码，连接体检中心、药房和小程序。', inputs: ['OCR报告', '兑换码', '用户授权'], outputs: ['结构化指标', '健康摘要', '复测任务'] },
    { id: 'skill-long-memory', name: '长期健康记忆', category: '底座', description: '沉淀个人基线、关键事件、干预响应和家属沟通历史。', inputs: ['历史分析', '体征趋势', '问诊摘要'], outputs: ['个体基线', '时间线摘要', '风险漂移'] },
    { id: 'skill-research-chain', name: '证据研究链', category: '底座', description: '面向复杂问题执行检索、证据补全、解释生成和审计留痕。', inputs: ['RiskPrompt', '知识库', '指南规则'], outputs: ['引用证据', '推理链', '医生复核要点'] },
    { id: 'skill-device-gateway', name: '硬件数据网关', category: '数据入口', description: '接入血压计、血糖仪、手环、PPG/ECG设备和家庭健康终端。', inputs: ['BLE设备', '厂商API', '家庭网关'], outputs: ['体征流', '质量评分', '异常窗口'] },
    { id: 'skill-insurance', name: '保险支付与风控', category: '商业闭环', description: '为保险客户生成健康管理计划、干预合规记录和理赔前后支持证据。', inputs: ['保单规则', '健康档案', '干预记录'], outputs: ['服务包建议', '风险分层', '履约证据'] },
    { id: 'skill-hospital', name: '院内院外联动', category: '医疗协作', description: '把小程序复测、报告摘要和急性预警工单同步到医生/运营台。', inputs: ['患者授权', '院外体征', '医生备注'], outputs: ['复核队列', '随访任务', '转诊建议'] },
    { id: 'skill-pharmacy', name: '药房健康管理', category: '零售药房', description: '支持药房场景的报告解读卡兑换、慢病随访、OTC用药提醒和复购任务。', inputs: ['门店订单', '报告卡', '用药史'], outputs: ['健康建议', '随访计划', '门店服务工单'] },
    { id: 'skill-rare-disease', name: '罕见病筛查', category: '差异化', description: '结合症状、家族史、基因线索和多模态异常，触发罕见病鉴别诊断提示。', inputs: ['症状簇', '家族史', '基因变异'], outputs: ['疑似疾病谱', '检查建议', '专家转诊线索'] },
    { id: 'skill-drug-discovery', name: 'AI药物发现', category: '差异化', description: '把真实世界健康管理数据与靶点、适应症和药物重定位线索连接。', inputs: ['表型数据', '靶点知识图谱', '药物数据库'], outputs: ['适应症线索', '候选靶点', '药物重定位假设'] }
  ],
  agentTemplates: [
    { id: 'template-checkup', name: '体检报告增长Agent', scenario: '体检中心/药房获客', skills: ['体检报告解读卡', '长期健康记忆', '证据研究链', '家属端同步'], outcome: '把单次体检解读转化为小程序长期健康管理用户。' },
    { id: 'template-chronic', name: '慢病随访Agent', scenario: '医院/药房/家庭医生', skills: ['硬件数据网关', '长期健康记忆', '风险评估', '健康宣教'], outcome: '形成复测、随访、医生复核和异常升级的闭环。' },
    { id: 'template-insurance', name: '保险健康管理Agent', scenario: '商业保险/养老险', skills: ['保险支付与风控', '报告解读', '干预履约', '院内院外联动'], outcome: '支撑保前分层、保中干预和理赔服务证据链。' },
    { id: 'template-rare', name: '罕见病线索Agent', scenario: '专病中心/科研合作', skills: ['罕见病筛查', '证据研究链', '基因PRS', '专家转诊'], outcome: '将长期健康轨迹中的异常模式转化为诊疗端线索。' },
    { id: 'template-drug', name: '药物发现Agent', scenario: '制药/科研', skills: ['AI药物发现', '真实世界数据', '靶点图谱', '研究链审计'], outcome: '围绕表型、适应症和靶点生成可验证研究假设。' }
  ],
  commercialPlays: [
    { id: 'hardware', name: '硬件数据入口', partnerType: '血压计/血糖仪/手环/PPG设备厂商', playbook: '设备数据进入 Vitalife 后自动生成个性化报告和复测任务，硬件成为连续数据源。' },
    { id: 'insurance', name: '保险+健康管理', partnerType: '商业保险/养老险/企业福利', playbook: '围绕心血管和抗衰风险形成保前评估、保中干预、理赔支持和续保服务。' },
    { id: 'hospital', name: '院内院外联动', partnerType: '医院/体检中心/专病中心', playbook: '把院外复测、小程序报告和急性预警转化为医生复核队列与随访任务。' },
    { id: 'pharmacy', name: '药房健康管理', partnerType: '连锁药房/中医馆/社区服务点', playbook: '通过报告解读卡和门店健康服务，把线下客流导入长期健康管理。' },
    { id: 'finance', name: '金融服务场景', partnerType: '银行/高净值客户服务/企业客户', playbook: '以健康报告、家庭健康档案和养老服务包增强客户经营。' }
  ],
  differentiators: [
    { id: 'rare-disease-depth', title: '罕见病诊断纵深', summary: '健康管理竞品通常停留在慢病和体检解释，Vitalife 可把异常长期轨迹延伸到罕见病线索。' },
    { id: 'drug-discovery', title: 'AI制药与药物发现', summary: '将真实世界多模态表型与靶点、适应症和药物重定位连接，形成科研和制药合作入口。' },
    { id: 'skill-coverage', title: '66个Skill可扩展', summary: '按 Agent + Skill 组装，可覆盖诊断、制药、药学、健康管理、保险和运营场景。' },
    { id: 'mimo-cost', title: 'MIMO API成本优势', summary: '以内部 MIMO API 作为底座，降低边际推理成本，更适合高频长期陪伴和企业级调用。' }
  ]
};

export const mockTimeline: TimelinePoint[] = [
  { id: '0', day: '周一', timestamp: '2026-05-03T08:30:00+08:00', heartRate: 78, hrv: 30, risk: 42 },
  { id: '1', day: '周二', timestamp: '2026-05-04T08:30:00+08:00', heartRate: 82, hrv: 27, risk: 47 },
  { id: '2', day: '周三', timestamp: '2026-05-05T08:30:00+08:00', heartRate: 80, hrv: 29, risk: 45 },
  { id: '3', day: '周四', timestamp: '2026-05-06T08:30:00+08:00', heartRate: 88, hrv: 23, risk: 56 },
  { id: '4', day: '周五', timestamp: '2026-05-07T08:30:00+08:00', heartRate: 84, hrv: 25, risk: 52 },
  { id: '5', day: '周六', timestamp: '2026-05-08T08:30:00+08:00', heartRate: 76, hrv: 35, risk: 39 },
  { id: '6', day: '周日', timestamp: '2026-05-09T08:30:00+08:00', heartRate: 86, hrv: 24, risk: 54 }
];

function resolveMockSkill(skillIdOrName: string, index: number): SkillDefinition {
  const skill = mockCapabilities.skills.find((item) => item.id === skillIdOrName || item.name === skillIdOrName);
  return (
    skill ?? {
      id: `template-skill-${index + 1}`,
      name: skillIdOrName,
      category: '模板内置',
      description: `${skillIdOrName} 能力由模板运行时注入。`,
      inputs: ['租户配置', '用户授权', '场景策略'],
      outputs: ['任务节点', '运营工单', '审计记录']
    }
  );
}

export function buildMockAgentBuild(templateId: string, skillIds: string[], tenant = 'Vitalife Sandbox', channel = 'web_console'): AgentBuild {
  const template = mockCapabilities.agentTemplates.find((item) => item.id === templateId) ?? mockCapabilities.agentTemplates[0];
  const skills = (skillIds.length ? skillIds : template.skills).map(resolveMockSkill);
  return {
    id: `mock-agent-build-${template.id}`,
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
      invocation: `/api/analysis/run?agentBuildId=mock-agent-build-${template.id}`,
      memory: '/api/patients/:id/memory',
      audit: `/api/agent-os/builds/mock-agent-build-${template.id}/audit`
    }
  };
}

export function buildMockReportCard(patient: Patient, cardCode = 'VITA-DEMO-2026', channel = 'wechat_miniprogram'): ReportCard {
  return {
    id: `mock-report-card-${patient.id}`,
    cardCode,
    patientId: patient.id,
    patientName: patient.name,
    channel,
    status: 'redeemed',
    redeemedAt: new Date().toISOString(),
    packageName: 'Vitalife 体检报告解读卡',
    summary: `${patient.name} 已兑换报告解读卡，系统将把体检OCR、基线体征和长期记忆合并生成健康摘要。`,
    tasks: ['上传体检报告或拍照页', '确认OCR关键字段', '完成一次60秒PPG复测', '生成家属可读摘要', '写入Vitalife MemOS'],
    outputs: ['结构化指标', '风险分层摘要', '复测任务', '医生复核要点']
  };
}

export function buildMockDeviceEvent(patient: Patient): DeviceEvent {
  const readings = {
    heartRate: patient.latest.heartRate,
    hrv: patient.latest.hrv,
    spo2: patient.latest.spo2,
    systolic: patient.latest.systolic,
    diastolic: patient.latest.diastolic
  };
  const riskFlags = [
    ...(readings.systolic >= 140 || readings.diastolic >= 90 ? ['血压高于家庭监测阈值'] : []),
    ...(readings.hrv <= 24 ? ['HRV低于恢复基线'] : [])
  ];

  return {
    id: `mock-device-${patient.id}`,
    patientId: patient.id,
    patientName: patient.name,
    deviceType: 'home_bp_monitor',
    createdAt: new Date().toISOString(),
    readings,
    quality: { completeness: 0.94, signalToNoise: 0.91, motionArtifact: 0.06 },
    riskFlags,
    tasks: riskFlags.length ? ['提醒用户静坐5分钟后复测', '同步照护者查看趋势', '必要时进入医生复核队列'] : ['写入长期体征趋势', '维持下次例行复测提醒']
  };
}

export function buildMockMemory(patient: Patient): PatientMemory {
  return {
    patientId: patient.id,
    profile: {
      patientName: patient.name,
      riskTier: patient.riskTier,
      caregiver: patient.caregiver,
      baseline: patient.baseline,
      latest: patient.latest
    },
    events: [
      {
        id: `mock-memory-analysis-${patient.id}`,
        patientId: patient.id,
        type: 'analysis',
        summary: patient.riskTier === 'high' ? '长期心血管风险偏高，需要持续复测与医生复核。' : '近期体征进入常规健康管理窗口。',
        source: 'agent_fusion',
        createdAt: patient.latest.updatedAt
      },
      {
        id: `mock-memory-profile-${patient.id}`,
        patientId: patient.id,
        type: 'baseline',
        summary: `${patient.name} 基线包含 ${patient.conditions.join('、')}。`,
        source: 'patient_profile',
        createdAt: patient.latest.updatedAt
      }
    ],
    summary: {
      baselineRisk: patient.riskTier,
      latestVitals: `${patient.latest.heartRate}bpm / ${patient.latest.systolic}/${patient.latest.diastolic}mmHg / SpO2 ${patient.latest.spo2}%`,
      continuity: '2 条长期记忆事件可用于个性化解释与复测提醒。'
    }
  };
}

function demoPceRisk(patient: Patient) {
  const isFemale = patient.sex === 'female';
  const totalCholesterol = patient.riskTier === 'high' ? 238 : patient.riskTier === 'medium' ? 212 : 178;
  const hdl = patient.riskTier === 'high' ? 42 : patient.riskTier === 'medium' ? 48 : 58;
  const treatedBp = patient.conditions.some((condition) => condition.includes('高血压'));
  const diabetes = patient.riskTier === 'high';
  const smoker = false;
  const model = isFemale
    ? {
        baseline: 0.9665,
        mean: -29.18,
        terms: {
          lnAge: -29.799,
          lnAgeSquared: 4.884,
          lnTc: 13.54,
          lnAgeLnTc: -3.114,
          lnHdl: -13.578,
          lnAgeLnHdl: 3.149,
          lnTreatedSbp: 2.019,
          lnUntreatedSbp: 1.957,
          smoker: 7.574,
          lnAgeSmoker: -1.665,
          diabetes: 0.661
        }
      }
    : {
        baseline: 0.9144,
        mean: 61.18,
        terms: {
          lnAge: 12.344,
          lnTc: 11.853,
          lnAgeLnTc: -2.664,
          lnHdl: -7.99,
          lnAgeLnHdl: 1.769,
          lnTreatedSbp: 1.797,
          lnUntreatedSbp: 1.764,
          smoker: 7.837,
          lnAgeSmoker: -1.795,
          diabetes: 0.658
        }
      };
  const lnAge = Math.log(patient.age);
  const lnTc = Math.log(totalCholesterol);
  const lnHdl = Math.log(hdl);
  const lnSbp = Math.log(patient.latest.systolic);
  let sum = 0;
  sum += (model.terms.lnAge ?? 0) * lnAge;
  sum += (model.terms.lnAgeSquared ?? 0) * lnAge * lnAge;
  sum += (model.terms.lnTc ?? 0) * lnTc;
  sum += (model.terms.lnAgeLnTc ?? 0) * lnAge * lnTc;
  sum += (model.terms.lnHdl ?? 0) * lnHdl;
  sum += (model.terms.lnAgeLnHdl ?? 0) * lnAge * lnHdl;
  sum += (treatedBp ? model.terms.lnTreatedSbp : model.terms.lnUntreatedSbp) * lnSbp;
  if (smoker) sum += model.terms.smoker + (model.terms.lnAgeSmoker ?? 0) * lnAge;
  if (diabetes) sum += model.terms.diabetes;
  const value = Math.round((1 - model.baseline ** Math.exp(sum - model.mean)) * 1000) / 10;
  return {
    value,
    category: value >= 20 ? 'high' : value >= 7.5 ? 'intermediate' : value >= 5 ? 'borderline' : 'low',
    inputs: { totalCholesterol, hdl, treatedBp, smoker, diabetes }
  };
}

export function buildMockAnalysis(patient: Patient): Analysis {
  const ascvd = demoPceRisk(patient);
  const bpCategory = patient.latest.systolic >= 140 || patient.latest.diastolic >= 90 ? 'stage_2_hypertension' : patient.latest.systolic >= 130 || patient.latest.diastolic >= 80 ? 'stage_1_hypertension' : 'normal';
  const riskScore = Math.min(96, Math.round(ascvd.value * 3.2 + (bpCategory === 'stage_2_hypertension' ? 14 : 4)));
  const riskLevel = ascvd.category === 'high' ? 'high' : ascvd.category === 'intermediate' || ascvd.category === 'borderline' ? 'medium' : patient.riskTier === 'high' ? 'high' : patient.riskTier;
  return {
    id: `mock-analysis-${patient.id}`,
    patient,
    taskGraph: [
      { step: 'S101', label: '采集多模态数据', status: 'completed' },
      { step: 'S103', label: '质量控制与预处理', status: 'completed' },
      { step: 'S105', label: '任务编排', status: 'completed' },
      { step: 'S106', label: '专家智能体并行分析', status: 'completed' },
      { step: 'S108', label: '构建证据图谱', status: 'completed' },
      { step: 'S109', label: '融合仲裁', status: 'completed' },
      { step: 'S110', label: '输出健康管理结果', status: 'completed' }
    ],
    qualityVectors: [
      { modality: 'face', score: 0.84, flags: ['光照合格', 'ROI完整'], status: 'usable' },
      { modality: 'signal', score: 0.89, flags: ['PPG稳定', '运动伪差低'], status: 'usable' },
      { modality: 'report', score: 0.76, flags: ['OCR需复核'], status: 'review' },
      { modality: 'genomic', score: 0.91, flags: ['PRS可用'], status: 'usable' }
    ],
    agentResults: [
      {
        agent: 'facecv_expert_agent',
        status: 'completed',
        evidence: [
          {
            id: 'face-age-delta',
            riskType: 'vascular_aging',
            source: 'face_roi_vector',
            label: '面部生物学年龄偏离',
            value: patient.baseline.faceAge - patient.age,
            unit: '岁',
            direction: patient.baseline.faceAge - patient.age > 4 ? 'risk_up' : 'neutral',
            confidence: 0.74,
            explanation: `FaceAge为${patient.baseline.faceAge}岁，与实际年龄形成偏离。`
          }
        ]
      },
      {
        agent: 'report_expert_agent',
        status: 'completed',
        evidence: [
          {
            id: 'report-ascvd-pce',
            riskType: 'cad',
            source: 'pooled_cohort_equations',
            label: '10年ASCVD风险',
            value: ascvd.value,
            unit: '%',
            direction: ['intermediate', 'high'].includes(ascvd.category) ? 'risk_up' : ascvd.category === 'borderline' ? 'watch' : 'neutral',
            confidence: 0.9,
            explanation: `ACC/AHA PCE 10年ASCVD风险为${ascvd.value}%，分层为${ascvd.category}。`,
            algorithm: {
              algorithm: 'ACC/AHA Pooled Cohort Equations',
              status: 'computed',
              category: ascvd.category,
              value: ascvd.value,
              unit: '%',
              source: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk'
            }
          }
        ]
      }
    ],
    fusion: {
      agent: 'comprehensive_analysis_agent',
      status: 'completed',
      riskPrompt: {
        patientId: patient.id,
        generatedAt: new Date().toISOString(),
        riskLevel,
        riskScore,
        emergencyFlag: false,
        vascularAgeDelta: Math.max(0, patient.baseline.vascularAge - patient.age),
        agingIndex: patient.baseline.faceAge - patient.age,
        clinicalRiskPercent: ascvd.value,
        clinicalAlgorithms: [
          {
            algorithm: 'ACC/AHA Pooled Cohort Equations',
            status: 'computed',
            category: ascvd.category,
            value: ascvd.value,
            unit: '%',
            source: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk'
          },
          {
            algorithm: 'ACC/AHA 2017 Blood Pressure Categories',
            status: 'computed',
            category: bpCategory,
            value: null,
            unit: null,
            source: '2017 ACC/AHA High Blood Pressure Guideline'
          }
        ],
        summary:
          riskLevel === 'high'
            ? '公开风险方程与血压分级提示长期心血管风险偏高，需医生复核并完善报告证据。'
            : riskLevel === 'medium'
              ? '公开风险方程或血压分级提示需要复测与生活方式干预。'
              : '当前公开风险方程分层较低，建议维持周期性监测。'
      },
      evidence: [],
      evidenceGraph: {
        nodes: [
          { id: 'cad', label: '冠心病风险', score: Math.min(1, ascvd.value / 20) },
          { id: 'acute', label: '急性事件', score: 0.18 },
          { id: 'aging', label: '血管老化', score: Math.max(0.1, patient.baseline.vascularAge - patient.age) },
          { id: 'metabolic', label: '代谢压力', score: patient.riskTier === 'low' ? 0.2 : 0.56 }
        ],
        references: [
          {
            id: 'kg-hrv',
            title: 'HRV下降与自主神经压力',
            source: '本地医学知识库',
            summary: 'HRV持续下降提示自主神经压力升高，应结合睡眠、运动和心率趋势判断。'
          }
        ]
      }
    },
    coach: {
      agent: 'user_interaction_agent',
      status: 'completed',
      actionList: ['完成一次60秒掌腹PPG复测', '补齐总胆固醇、HDL-C、LDL-C和血糖字段', '将ASCVD风险结果提交医生复核'],
      tone: 'coach',
      message: '本周重点是用公开风险方程完成复核，并补齐报告证据。'
    }
  };
}

export function buildMockEmergency(patient: Patient): EmergencyEvent {
  return {
    id: `mock-emergency-${patient.id}`,
    patientId: patient.id,
    patientName: patient.name,
    createdAt: new Date().toISOString(),
    status: 'pending_confirmation',
    riskPrompt: {
      patientId: patient.id,
      generatedAt: new Date().toISOString(),
      riskLevel: 'urgent',
      riskScore: 92,
      emergencyFlag: true,
      vascularAgeDelta: Math.max(0, patient.baseline.vascularAge - patient.age),
      agingIndex: patient.baseline.faceAge - patient.age,
      summary: '实时窗口存在急性风险信号，建议立即确认用户状态并通知照护者。'
    },
    actionList: ['立即进行端侧强提醒并请求用户确认', '若30秒内无响应，通知预设家属/照护者', '将异常窗口、定位和证据摘要写入审计日志']
  };
}
