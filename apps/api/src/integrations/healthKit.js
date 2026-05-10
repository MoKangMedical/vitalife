export const healthKitPipeline = {
  provider: 'huawei_health_kit',
  channel: 'native_companion_app',
  positioning: '华为手表不走微信小程序内置能力，作为增强数据源通过华为 Health Kit 授权后进入 Vitalife 设备网关。',
  stages: [
    { step: '01', name: '用户授权', detail: '在华为生态应用中申请运动、心率、睡眠、血氧、血压等最小必要范围。' },
    { step: '02', name: '端侧采集', detail: '由手表和华为运动健康沉淀连续样本，保留设备、时间戳、单位和质量字段。' },
    { step: '03', name: 'Health Kit读取', detail: 'Companion App 使用 Health Kit SDK 按授权范围读取增量样本。' },
    { step: '04', name: '标准化入库', detail: '服务端映射为 Vitalife 统一 readings、质量向量、来源审计和用户同意记录。' },
    { step: '05', name: 'Agent融合', detail: '与微信运动、家庭设备、报告OCR、PPG和MemOS一起进入风险解释与复测任务。' }
  ],
  supportedDataTypes: [
    { type: 'steps', unit: 'count', vitalifeField: 'stepsToday' },
    { type: 'heart_rate', unit: 'bpm', vitalifeField: 'heartRate' },
    { type: 'resting_heart_rate', unit: 'bpm', vitalifeField: 'restingHeartRate' },
    { type: 'hrv', unit: 'ms', vitalifeField: 'hrv' },
    { type: 'spo2', unit: '%', vitalifeField: 'spo2' },
    { type: 'blood_pressure_systolic', unit: 'mmHg', vitalifeField: 'systolic' },
    { type: 'blood_pressure_diastolic', unit: 'mmHg', vitalifeField: 'diastolic' },
    { type: 'sleep_score', unit: 'score', vitalifeField: 'sleepScore' },
    { type: 'sleep_duration_minutes', unit: 'min', vitalifeField: 'sleepDurationMinutes' },
    { type: 'workout_minutes', unit: 'min', vitalifeField: 'workoutMinutes' }
  ],
  controls: ['用户授权可撤回', '只采集健康管理所需字段', '保留设备来源与时间戳', '医生端输出仅作健康管理和复核提示']
};

const typeMap = new Map(healthKitPipeline.supportedDataTypes.map((item) => [item.type, item]));

function nowIso() {
  return new Date().toISOString();
}

function latestByType(samples) {
  const latest = new Map();
  for (const sample of samples) {
    const mapping = typeMap.get(sample.type);
    const value = Number(sample.value);
    if (!mapping || !Number.isFinite(value)) continue;
    const endTime = sample.endTime || sample.startTime || nowIso();
    const previous = latest.get(sample.type);
    if (!previous || new Date(endTime).getTime() >= new Date(previous.endTime).getTime()) {
      latest.set(sample.type, {
        ...sample,
        value,
        endTime,
        vitalifeField: mapping.vitalifeField,
        unit: sample.unit || mapping.unit
      });
    }
  }
  return latest;
}

function buildReadings(samples) {
  const latest = latestByType(samples);
  const readings = {};
  for (const sample of latest.values()) {
    readings[sample.vitalifeField] = Math.round(sample.value * 10) / 10;
  }
  return readings;
}

export function createHealthKitDeviceEvent(patient, payload) {
  const samples = Array.isArray(payload.samples) ? payload.samples : [];
  const readings = buildReadings(samples);
  if (!Object.keys(readings).length) {
    throw new Error('healthkit_no_supported_samples');
  }

  const riskFlags = [];
  if (readings.systolic >= 140 || readings.diastolic >= 90) riskFlags.push('Health Kit血压样本达到家庭监测高值');
  if (readings.heartRate >= 100) riskFlags.push('Health Kit心率样本偏快');
  if (readings.hrv > 0 && readings.hrv <= 20) riskFlags.push('Health Kit HRV低于恢复基线');
  if (readings.spo2 > 0 && readings.spo2 < 95) riskFlags.push('Health Kit血氧样本需复测');
  if (readings.sleepScore > 0 && readings.sleepScore < 60) riskFlags.push('Health Kit睡眠评分偏低');
  if (readings.stepsToday > 0 && readings.stepsToday < 2500) riskFlags.push('Health Kit今日活动量不足');

  const sampleTimes = samples
    .map((sample) => new Date(sample.endTime || sample.startTime || '').getTime())
    .filter((value) => Number.isFinite(value));
  const latestAt = sampleTimes.length ? new Date(Math.max(...sampleTimes)).toISOString() : nowIso();
  const sourceDevices = [...new Set(samples.map((sample) => sample.sourceDevice).filter(Boolean))];

  return {
    id: `healthkit-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    deviceType: 'huawei_health_kit',
    createdAt: nowIso(),
    readings,
    quality: {
      completeness: Math.min(1, Math.round((Object.keys(readings).length / typeMap.size) * 100) / 100),
      signalToNoise: 0.92,
      motionArtifact: 0.04
    },
    riskFlags,
    tasks: riskFlags.length
      ? ['将华为手表异常窗口写入医生复核队列', '提醒用户完成一次静息复测', '补齐症状和用药上下文']
      : ['纳入增强数据源趋势', '维持每周运动和睡眠复盘', '继续观察心率-睡眠-活动联动'],
    source: {
      provider: 'huawei_health_kit',
      channel: healthKitPipeline.channel,
      recordCount: samples.length,
      latestAt,
      sourceDevices,
      consentAt: payload.authorization?.consentAt || null,
      scopes: payload.authorization?.scopes || []
    },
    pipeline: healthKitPipeline.stages
  };
}

export function demoHealthKitSamples(patient) {
  const now = new Date();
  const iso = (minutesAgo) => new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
  return [
    { type: 'steps', value: patient.latest.steps + 420, unit: 'count', startTime: iso(1440), endTime: iso(10), sourceDevice: 'HUAWEI WATCH' },
    { type: 'heart_rate', value: patient.latest.heartRate, unit: 'bpm', startTime: iso(12), endTime: iso(10), sourceDevice: 'HUAWEI WATCH' },
    { type: 'hrv', value: patient.latest.hrv, unit: 'ms', startTime: iso(30), endTime: iso(10), sourceDevice: 'HUAWEI WATCH' },
    { type: 'spo2', value: patient.latest.spo2, unit: '%', startTime: iso(40), endTime: iso(12), sourceDevice: 'HUAWEI WATCH' },
    { type: 'sleep_score', value: patient.latest.sleepScore, unit: 'score', startTime: iso(520), endTime: iso(120), sourceDevice: 'HUAWEI WATCH' },
    { type: 'blood_pressure_systolic', value: patient.latest.systolic, unit: 'mmHg', startTime: iso(25), endTime: iso(24), sourceDevice: 'HUAWEI WATCH D' },
    { type: 'blood_pressure_diastolic', value: patient.latest.diastolic, unit: 'mmHg', startTime: iso(25), endTime: iso(24), sourceDevice: 'HUAWEI WATCH D' }
  ];
}
