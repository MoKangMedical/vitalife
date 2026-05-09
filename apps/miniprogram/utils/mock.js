const patients = [
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

const timeline = [
  { id: '0', day: '周一', heartRate: 78, hrv: 30, risk: 42 },
  { id: '1', day: '周二', heartRate: 82, hrv: 27, risk: 47 },
  { id: '2', day: '周三', heartRate: 80, hrv: 29, risk: 45 },
  { id: '3', day: '周四', heartRate: 88, hrv: 23, risk: 56 },
  { id: '4', day: '周五', heartRate: 84, hrv: 25, risk: 52 },
  { id: '5', day: '周六', heartRate: 76, hrv: 35, risk: 39 },
  { id: '6', day: '周日', heartRate: 86, hrv: 24, risk: 54 }
];

function mockOverview() {
  return {
    users: patients.length,
    highRisk: patients.filter((patient) => patient.riskTier === 'high').length,
    monitoredDevices: 18,
    activeAgents: 9,
    reusableSkills: 9,
    agentTemplates: 5,
    emergencyEvents: 0,
    modules: ['MIMO底座', 'Vitalife MemOS', '证据研究链', 'Agent OS', 'Skill市场', '采集终端', '质量控制', '专家智能体', '证据图谱', '融合仲裁', '交互闭环']
  };
}

function mockCapabilities() {
  return {
    positioning: 'Vitalife 采用 MIMO API 多模态底座 + C端长期健康陪伴 + B端 Agent OS 开放平台的三层模式，并向罕见病筛查和药物发现延伸。',
    layers: [
      { id: 'foundation', name: '底座层', title: 'MIMO Health Foundation', summary: '统一接入文本、报告、面部视觉、PPG/ECG、家庭设备、基因PRS和症状轨迹。', modules: ['MIMO API', 'Vitalife MemOS', 'Vitalife Research', '证据图谱'] },
      { id: 'consumer', name: 'C端', title: 'Vitalife Companion', summary: '面向老人、家属和慢病人群，提供长期健康记忆、报告解读、复测提醒和体检报告解读卡。', modules: ['微信小程序', '报告卡', '家属同步', '急救联动'] },
      { id: 'business', name: 'B端', title: 'Vitalife Agent OS', summary: '以 Agent + Skill 的可组装模式开放给医院、保险、药房、体检中心和硬件厂商。', modules: ['Agent编排', 'Skill市场', '企业API', '审计'] }
    ],
    skills: [
      { id: 'skill-report-card', name: '体检报告解读卡', category: 'C端获客', description: '把AI报告解读物化成线下卡片/兑换码，连接体检中心、药房和小程序。' },
      { id: 'skill-long-memory', name: '长期健康记忆', category: '底座', description: '沉淀个人基线、关键事件、干预响应和家属沟通历史。' },
      { id: 'skill-research-chain', name: '证据研究链', category: '底座', description: '执行检索、证据补全、解释生成和审计留痕。' },
      { id: 'skill-device-gateway', name: '硬件数据网关', category: '数据入口', description: '接入血压计、血糖仪、手环、PPG/ECG设备和家庭健康终端。' },
      { id: 'skill-insurance', name: '保险支付与风控', category: '商业闭环', description: '生成健康管理计划、干预合规记录和理赔前后支持证据。' },
      { id: 'skill-hospital', name: '院内院外联动', category: '医疗协作', description: '把小程序复测、报告摘要和急性预警工单同步到医生/运营台。' },
      { id: 'skill-pharmacy', name: '药房健康管理', category: '零售药房', description: '支持报告卡兑换、慢病随访、OTC用药提醒和门店服务工单。' },
      { id: 'skill-rare-disease', name: '罕见病筛查', category: '差异化', description: '结合症状、家族史、基因线索和多模态异常，触发鉴别诊断提示。' },
      { id: 'skill-drug-discovery', name: 'AI药物发现', category: '差异化', description: '把真实世界表型与靶点、适应症和药物重定位线索连接。' }
    ],
    agentTemplates: [
      { id: 'template-checkup', name: '体检报告增长Agent', scenario: '体检中心/药房获客', outcome: '把单次体检解读转化为小程序长期健康管理用户。' },
      { id: 'template-chronic', name: '慢病随访Agent', scenario: '医院/药房/家庭医生', outcome: '形成复测、随访、医生复核和异常升级闭环。' },
      { id: 'template-insurance', name: '保险健康管理Agent', scenario: '商业保险/养老险', outcome: '支撑保前分层、保中干预和理赔服务证据链。' },
      { id: 'template-rare', name: '罕见病线索Agent', scenario: '专病中心/科研合作', outcome: '将长期健康轨迹异常模式转化为诊疗端线索。' },
      { id: 'template-drug', name: '药物发现Agent', scenario: '制药/科研', outcome: '围绕表型、适应症和靶点生成可验证研究假设。' }
    ],
    commercialPlays: [
      { id: 'hardware', name: '硬件数据入口', partnerType: '设备厂商', playbook: '设备数据进入 Vitalife 后自动生成个性化报告和复测任务。' },
      { id: 'insurance', name: '保险+健康管理', partnerType: '商业保险', playbook: '形成保前评估、保中干预、理赔支持和续保服务。' },
      { id: 'hospital', name: '院内院外联动', partnerType: '医院/体检中心', playbook: '把院外复测和预警转化为医生复核队列与随访任务。' },
      { id: 'pharmacy', name: '药房健康管理', partnerType: '连锁药房', playbook: '通过报告卡和门店健康服务导入长期健康管理。' },
      { id: 'finance', name: '金融服务场景', partnerType: '银行/企业客户', playbook: '以家庭健康档案和养老服务包增强客户经营。' }
    ],
    differentiators: [
      { id: 'rare-disease-depth', title: '罕见病诊断纵深', summary: '从健康管理延伸到罕见病线索。' },
      { id: 'drug-discovery', title: 'AI制药与药物发现', summary: '连接真实世界表型、靶点和适应症。' },
      { id: 'skill-coverage', title: '66个Skill可扩展', summary: '覆盖诊断、制药、药学、健康管理、保险和运营。' },
      { id: 'mimo-cost', title: 'MIMO API成本优势', summary: '支撑高频长期陪伴和企业级调用。' }
    ]
  };
}

function getPatient(patientId) {
  return patients.find((patient) => patient.id === patientId) || patients[0];
}

function buildMockAnalysis(patient) {
  const riskScore = patient.riskTier === 'high' ? 77 : patient.riskTier === 'medium' ? 54 : 24;
  const riskLevel = patient.riskTier === 'high' ? 'high' : patient.riskTier;
  const vascularAgeDelta = Math.max(0, patient.baseline.vascularAge - patient.age);

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
            label: '面部生物学年龄偏离',
            source: 'face_roi_vector',
            direction: vascularAgeDelta > 4 ? 'risk_up' : 'neutral',
            confidence: 0.74,
            explanation: `FaceAge为${patient.baseline.faceAge}岁，血管年龄偏离${vascularAgeDelta}岁。`
          }
        ]
      },
      {
        agent: 'signals_expert_agent',
        status: 'completed',
        evidence: [
          {
            id: 'signal-hrv-pressure',
            label: 'HRV自主神经压力',
            source: 'ppg_series',
            direction: patient.latest.hrv < patient.baseline.hrv ? 'risk_up' : 'neutral',
            confidence: 0.82,
            explanation: `HRV当前${patient.latest.hrv}ms，低于个人基线。`
          }
        ]
      }
    ],
    fusion: {
      riskPrompt: {
        patientId: patient.id,
        generatedAt: new Date().toISOString(),
        riskLevel,
        riskScore,
        emergencyFlag: false,
        vascularAgeDelta,
        agingIndex: patient.baseline.faceAge - patient.age,
        summary:
          patient.riskTier === 'high'
            ? '长期心血管风险偏高，报告、信号和遗传证据存在同向支持。'
            : patient.riskTier === 'medium'
              ? '近期自主神经压力和血管代谢线索提示需要复测与生活方式干预。'
              : '当前综合风险较低，建议维持周期性监测。'
      },
      evidenceGraph: {
        nodes: [
          { id: 'cad', label: '冠心病风险', score: patient.riskTier === 'high' ? 0.78 : 0.42 },
          { id: 'acute', label: '急性事件', score: 0.18 },
          { id: 'aging', label: '血管老化', score: Math.min(1, vascularAgeDelta / 12) },
          { id: 'metabolic', label: '代谢压力', score: patient.riskTier === 'low' ? 0.2 : 0.56 }
        ]
      }
    },
    coach: {
      actionList: ['完成一次60秒掌腹PPG复测', '记录今日睡眠、运动和胸闷/心悸症状', '将最近体检报告补充到报告解析模块'],
      tone: 'coach',
      message: '本周重点是复测PPG、改善睡眠恢复并补齐报告证据。'
    }
  };
}

function buildMockEmergency(patient) {
  const analysis = buildMockAnalysis(patient);
  analysis.fusion.riskPrompt = {
    ...analysis.fusion.riskPrompt,
    riskLevel: 'urgent',
    riskScore: 92,
    emergencyFlag: true,
    summary: '实时窗口存在急性风险信号，建议立即确认用户状态并通知照护者。'
  };
  analysis.coach = {
    actionList: ['立即进行端侧强提醒并请求用户确认', '若30秒内无响应，通知预设家属/照护者', '将异常窗口、定位和证据摘要写入审计日志'],
    tone: 'emergency',
    message: '检测到需要立即确认的急性风险信号，请启动预警闭环。'
  };

  return {
    event: {
      id: `mock-emergency-${patient.id}`,
      patientId: patient.id,
      patientName: patient.name,
      createdAt: new Date().toISOString(),
      status: 'pending_confirmation',
      riskPrompt: analysis.fusion.riskPrompt,
      actionList: analysis.coach.actionList
    },
    analysis
  };
}

function resolveMockSkill(skillIdOrName, index) {
  const capabilities = mockCapabilities();
  const skill = capabilities.skills.find((item) => item.id === skillIdOrName || item.name === skillIdOrName);
  return (
    skill || {
      id: `template-skill-${index + 1}`,
      name: skillIdOrName,
      category: '模板内置',
      description: `${skillIdOrName} 能力由模板运行时注入。`
    }
  );
}

function buildMockAgentBuild(templateId, skillIds, tenant = 'Vitalife Sandbox', channel = 'wechat_miniprogram') {
  const capabilities = mockCapabilities();
  const template = capabilities.agentTemplates.find((item) => item.id === templateId) || capabilities.agentTemplates[0];
  const skills = (skillIds && skillIds.length ? skillIds : template.skills || []).map(resolveMockSkill);
  return {
    id: `mock-agent-build-${template.id}`,
    tenant,
    channel,
    status: 'ready_for_sandbox',
    createdAt: new Date().toISOString(),
    template,
    skills,
    workflow: [
      { step: '01', name: '租户与场景配置', detail: `加载 ${tenant} 的授权、服务包与渠道策略。` },
      { step: '02', name: 'Skill装配', detail: `装配 ${skills.map((skill) => skill.name).join('、')}。` },
      { step: '03', name: 'MIMO多模态接入', detail: '接入报告、体征、症状、长期记忆和设备流。' },
      { step: '04', name: '证据研究链', detail: '生成可复核 RiskPrompt、证据摘要和医生复核要点。' },
      { step: '05', name: '发布到沙盒', detail: '输出企业API、运营台工单和小程序任务入口。' }
    ],
    riskControls: ['非诊断性健康管理输出', '高风险结果进入医生复核队列', '用户授权与审计日志必填']
  };
}

function buildMockReportCard(patient, cardCode = 'VITA-DEMO-2026') {
  return {
    id: `mock-report-card-${patient.id}`,
    cardCode,
    patientId: patient.id,
    patientName: patient.name,
    channel: 'wechat_miniprogram',
    status: 'redeemed',
    redeemedAt: new Date().toISOString(),
    packageName: 'Vitalife 体检报告解读卡',
    summary: `${patient.name} 已兑换报告解读卡，进入报告解读与复测任务闭环。`,
    tasks: ['上传体检报告或拍照页', '确认OCR关键字段', '完成一次60秒PPG复测', '生成家属可读摘要']
  };
}

function buildMockDeviceEvent(patient) {
  const readings = {
    heartRate: patient.latest.heartRate,
    hrv: patient.latest.hrv,
    spo2: patient.latest.spo2,
    systolic: patient.latest.systolic,
    diastolic: patient.latest.diastolic
  };
  return {
    id: `mock-device-${patient.id}`,
    patientId: patient.id,
    patientName: patient.name,
    deviceType: 'home_bp_monitor',
    createdAt: new Date().toISOString(),
    readings,
    quality: { completeness: 0.94, signalToNoise: 0.91, motionArtifact: 0.06 },
    riskFlags: readings.systolic >= 140 ? ['血压高于家庭监测阈值'] : ['体征已写入长期趋势'],
    tasks: ['提醒用户静坐5分钟后复测', '同步照护者查看趋势']
  };
}

function buildMockMemory(patient) {
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
        id: `mock-memory-profile-${patient.id}`,
        patientId: patient.id,
        type: 'baseline',
        summary: `${patient.name} 基线包含 ${patient.conditions.join('、')}。`,
        source: 'patient_profile',
        createdAt: patient.latest.updatedAt
      },
      {
        id: `mock-memory-trend-${patient.id}`,
        patientId: patient.id,
        type: 'trend',
        summary: `最近7日趋势已进入个性化解释与复测提醒。`,
        source: 'weekly_series',
        createdAt: patient.latest.updatedAt
      }
    ],
    summary: {
      baselineRisk: patient.riskTier,
      latestVitals: `${patient.latest.heartRate}bpm / ${patient.latest.systolic}/${patient.latest.diastolic}mmHg`,
      continuity: '2 条长期记忆事件可用于个性化解释。'
    }
  };
}

module.exports = {
  patients,
  timeline,
  buildMockAgentBuild,
  buildMockAnalysis,
  buildMockDeviceEvent,
  buildMockEmergency,
  buildMockMemory,
  buildMockReportCard,
  getPatient,
  mockCapabilities,
  mockOverview
};
