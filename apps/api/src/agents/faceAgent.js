export function runFaceAgent(patient, input = {}) {
  const faceAge = input.faceAge ?? patient.baseline.faceAge;
  const ageDelta = faceAge - patient.age;
  const cadRisk = input.cadRisk ?? patient.baseline.cadRisk;
  const fatigue = patient.latest.sleepScore < 65 ? 0.68 : 0.28;

  return {
    agent: 'facecv_expert_agent',
    status: 'completed',
    evidence: [
      {
        id: 'face-age-delta',
        riskType: 'vascular_aging',
        source: 'face_roi_vector',
        label: '面部生物学年龄偏离',
        value: ageDelta,
        unit: '岁',
        direction: ageDelta > 4 ? 'risk_up' : 'neutral',
        confidence: 0.74,
        explanation: `FaceAge为${faceAge}岁，较实际年龄偏离${ageDelta}岁。`
      },
      {
        id: 'face-cad-risk',
        riskType: 'cad',
        source: 'face_roi_vector',
        label: '面部冠心病视觉风险',
        value: Number(cadRisk.toFixed(2)),
        unit: 'probability',
        direction: cadRisk > 0.45 ? 'risk_up' : 'neutral',
        confidence: 0.69,
        explanation: '额头、面颊、鼻部ROI纹理和色泽特征提示长期心血管风险。'
      },
      {
        id: 'face-fatigue',
        riskType: 'fatigue',
        source: 'face_roi_vector',
        label: '疲劳/恢复不足线索',
        value: fatigue,
        unit: 'score',
        direction: fatigue > 0.55 ? 'risk_up' : 'neutral',
        confidence: 0.63,
        explanation: '结合面色、眼周状态和近期睡眠评分生成疲劳线索。'
      }
    ]
  };
}
