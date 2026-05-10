import { calculateHrvDeviation, classifyBloodPressure, triageVitalSigns } from '../medical/algorithms.js';

export function runSignalAgent(patient, input = {}) {
  const latest = { ...patient.latest, ...input };
  const hrv = calculateHrvDeviation(latest.hrv, patient.baseline.hrv);
  const bp = classifyBloodPressure(latest.systolic, latest.diastolic);
  const triage = triageVitalSigns({ heartRate: latest.heartRate, spo2: latest.spo2 });
  const pressureScore = hrv.status === 'computed' ? Math.min(1, Math.max(0, hrv.percentDrop / 45)) : 0;
  const bloodPressureRisk =
    bp.category === 'hypertensive_crisis_range'
      ? 1
      : bp.category === 'stage_2_hypertension'
        ? 0.78
        : bp.category === 'stage_1_hypertension'
          ? 0.54
          : bp.category === 'elevated'
            ? 0.34
            : 0.14;
  const emergencyScore = triage.severity === 'urgent' ? 0.92 : triage.severity === 'watch' ? 0.52 : 0.12;

  return {
    agent: 'signals_expert_agent',
    status: 'completed',
    windowSeconds: 10,
    algorithms: [hrv, bp, triage],
    evidence: [
      {
        id: 'signal-hrv-pressure',
        riskType: 'autonomic_pressure',
        source: 'ppg_series',
        label: 'HRV自主神经压力',
        value: Number(pressureScore.toFixed(2)),
        unit: 'score',
        direction: hrv.category === 'large_drop' ? 'risk_up' : hrv.category === 'moderate_drop' ? 'watch' : 'neutral',
        confidence: 0.82,
        explanation:
          hrv.status === 'computed'
            ? `HRV当前${latest.hrv}ms，较个人基线下降${hrv.percentDrop}%。`
            : 'HRV缺少可比较的个人基线。',
        algorithm: hrv
      },
      {
        id: 'signal-bp',
        riskType: 'cardiometabolic',
        source: 'wearable_vitals',
        label: '血压分级',
        value: bloodPressureRisk,
        unit: 'score',
        direction: bloodPressureRisk > 0.6 ? 'risk_up' : 'neutral',
        confidence: 0.76,
        explanation: `${bp.label}：${latest.systolic}/${latest.diastolic}mmHg。`,
        algorithm: bp
      },
      {
        id: 'signal-emergency',
        riskType: 'acute_event',
        source: 'ecg_ppg_window',
        label: '生命体征阈值分诊',
        value: Number(emergencyScore.toFixed(2)),
        unit: 'score',
        direction: emergencyScore > 0.75 ? 'urgent' : emergencyScore > 0.45 ? 'watch' : 'neutral',
        confidence: 0.8,
        explanation:
          triage.flags.length > 0
            ? triage.flags.map((flag) => flag.label).join('；')
            : '心率与血氧未触发预警阈值。',
        algorithm: triage
      }
    ]
  };
}
