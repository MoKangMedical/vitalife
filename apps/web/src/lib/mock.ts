import type { Analysis, EmergencyEvent, Overview, Patient, TimelinePoint } from './types';

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
  activeAgents: 5,
  emergencyEvents: 0,
  modules: ['采集终端', '质量控制', '专家智能体', '证据图谱', '融合仲裁', '交互闭环']
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

export function buildMockAnalysis(patient: Patient): Analysis {
  const riskScore = patient.riskTier === 'high' ? 76 : patient.riskTier === 'medium' ? 54 : 24;
  const riskLevel = patient.riskTier === 'high' ? 'high' : patient.riskTier;
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
        agent: 'signals_expert_agent',
        status: 'completed',
        evidence: [
          {
            id: 'signal-hrv-pressure',
            riskType: 'autonomic_pressure',
            source: 'ppg_series',
            label: 'HRV自主神经压力',
            value: patient.latest.hrv,
            unit: 'ms',
            direction: patient.latest.hrv < patient.baseline.hrv ? 'risk_up' : 'neutral',
            confidence: 0.82,
            explanation: '当前HRV低于个人基线，需要结合睡眠和心率趋势复测。'
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
        summary:
          patient.riskTier === 'high'
            ? '长期心血管风险偏高，报告、信号和遗传证据存在同向支持。'
            : patient.riskTier === 'medium'
              ? '近期自主神经压力和血管代谢线索提示需要复测与生活方式干预。'
              : '当前综合风险较低，建议维持周期性监测。'
      },
      evidence: [],
      evidenceGraph: {
        nodes: [
          { id: 'cad', label: '冠心病风险', score: patient.riskTier === 'high' ? 0.78 : 0.42 },
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
      actionList: ['完成一次60秒掌腹PPG复测', '记录今日睡眠、运动和胸闷/心悸症状', '将最近体检报告补充到报告解析模块'],
      tone: 'coach',
      message: '本周重点是复测PPG、改善睡眠恢复并补齐报告证据。'
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
