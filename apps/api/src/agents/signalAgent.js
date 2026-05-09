export function runSignalAgent(patient, input = {}) {
  const latest = { ...patient.latest, ...input };
  const hrvDrop = patient.baseline.hrv - latest.hrv;
  const pressureScore = Math.min(1, Math.max(0, hrvDrop / 25 + (latest.heartRate - patient.baseline.restingHr) / 80));
  const bloodPressureRisk = latest.systolic >= 140 || latest.diastolic >= 90 ? 0.78 : 0.24;
  const emergencyScore =
    latest.heartRate > 135 || latest.heartRate < 42 || latest.spo2 < 90 ? 0.82 : pressureScore > 0.7 ? 0.52 : 0.18;

  return {
    agent: 'signals_expert_agent',
    status: 'completed',
    windowSeconds: 10,
    evidence: [
      {
        id: 'signal-hrv-pressure',
        riskType: 'autonomic_pressure',
        source: 'ppg_series',
        label: 'HRV自主神经压力',
        value: Number(pressureScore.toFixed(2)),
        unit: 'score',
        direction: pressureScore > 0.55 ? 'risk_up' : 'neutral',
        confidence: 0.82,
        explanation: `HRV当前${latest.hrv}ms，较基线下降${hrvDrop}ms。`
      },
      {
        id: 'signal-bp',
        riskType: 'cardiometabolic',
        source: 'wearable_vitals',
        label: '血压风险线索',
        value: bloodPressureRisk,
        unit: 'score',
        direction: bloodPressureRisk > 0.6 ? 'risk_up' : 'neutral',
        confidence: 0.76,
        explanation: `最近血压${latest.systolic}/${latest.diastolic}mmHg。`
      },
      {
        id: 'signal-emergency',
        riskType: 'acute_event',
        source: 'ecg_ppg_window',
        label: '急性事件窗口评分',
        value: Number(emergencyScore.toFixed(2)),
        unit: 'score',
        direction: emergencyScore > 0.75 ? 'urgent' : emergencyScore > 0.45 ? 'watch' : 'neutral',
        confidence: 0.8,
        explanation: '基于心率、PPG脉搏波、血氧和HRV窗口计算急性预警评分。'
      }
    ]
  };
}
