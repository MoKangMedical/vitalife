export const patients = [
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

export const weeklySeries = [
  { day: '周一', heartRate: 78, hrv: 30, risk: 42 },
  { day: '周二', heartRate: 82, hrv: 27, risk: 47 },
  { day: '周三', heartRate: 80, hrv: 29, risk: 45 },
  { day: '周四', heartRate: 88, hrv: 23, risk: 56 },
  { day: '周五', heartRate: 84, hrv: 25, risk: 52 },
  { day: '周六', heartRate: 76, hrv: 35, risk: 39 },
  { day: '周日', heartRate: 86, hrv: 24, risk: 54 }
];

export const knowledgeSnippets = [
  {
    id: 'kg-hrv',
    title: 'HRV下降与自主神经压力',
    source: '本地医学知识库',
    summary: 'HRV持续下降提示自主神经压力升高，应结合睡眠、运动和心率趋势判断。'
  },
  {
    id: 'kg-ldl',
    title: 'LDL-C与冠心病风险',
    source: '指南摘要',
    summary: '低密度脂蛋白胆固醇升高是冠心病长期风险的重要证据，需要结合年龄、血压和家族史。'
  },
  {
    id: 'kg-emergency',
    title: '严重心律异常紧急处置',
    source: '急救流程库',
    summary: '疑似室颤、停搏或持续无脉搏信号时，应进行本地强提醒并通知照护者或急救资源。'
  }
];
