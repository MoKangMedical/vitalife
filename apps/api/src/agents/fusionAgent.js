function normalizeEvidenceValue(evidence) {
  if (evidence.unit === '岁') return Math.min(1, Math.max(0, evidence.value) / 12);
  if (evidence.unit === 'mmol/L') return Math.min(1, Math.max(0, evidence.value) / 5);
  if (evidence.unit === 'mg/L') return Math.min(1, Math.max(0, evidence.value) / 5);
  if (evidence.unit === 'percentile' && evidence.value > 1) return Math.min(1, evidence.value / 100);
  return Math.min(1, Math.max(0, evidence.value));
}

function evidenceWeight(evidence) {
  const directionWeight = evidence.direction === 'urgent' ? 1.4 : evidence.direction === 'risk_up' ? 1 : 0.35;
  return normalizeEvidenceValue(evidence) * evidence.confidence * directionWeight;
}

export function runFusionAgent(patient, agentResults, qualityVectors, snippets) {
  const evidence = agentResults.flatMap((result) => result.evidence);
  const qualityScore =
    qualityVectors.reduce((sum, item) => sum + item.score, 0) / Math.max(qualityVectors.length, 1);
  const cadEvidence = evidence.filter((item) => item.riskType === 'cad').reduce((sum, item) => sum + evidenceWeight(item), 0);
  const acuteEvidence = evidence
    .filter((item) => item.riskType === 'acute_event')
    .reduce((sum, item) => sum + evidenceWeight(item), 0);
  const agingEvidence = evidence
    .filter((item) => item.riskType === 'vascular_aging')
    .reduce((sum, item) => sum + evidenceWeight(item), 0);
  const metabolicEvidence = evidence
    .filter((item) => ['metabolic', 'cardiometabolic'].includes(item.riskType))
    .reduce((sum, item) => sum + evidenceWeight(item), 0);

  const rawScore = cadEvidence * 26 + acuteEvidence * 32 + agingEvidence * 14 + metabolicEvidence * 16;
  const riskScore = Math.min(96, Math.round(rawScore * qualityScore + (patient.riskTier === 'high' ? 18 : 4)));
  const riskLevel = acuteEvidence > 0.75 ? 'urgent' : riskScore >= 70 ? 'high' : riskScore >= 45 ? 'medium' : 'low';
  const vascularAgeDelta = Math.max(0, Math.round(patient.baseline.vascularAge - patient.age + agingEvidence * 3));

  return {
    agent: 'comprehensive_analysis_agent',
    status: 'completed',
    riskPrompt: {
      patientId: patient.id,
      generatedAt: new Date().toISOString(),
      riskLevel,
      riskScore,
      emergencyFlag: riskLevel === 'urgent',
      vascularAgeDelta,
      agingIndex: patient.baseline.faceAge - patient.age,
      summary:
        riskLevel === 'urgent'
          ? '实时窗口存在急性风险信号，建议立即确认用户状态并通知照护者。'
          : riskLevel === 'high'
            ? '长期心血管风险偏高，报告、信号和遗传证据存在同向支持。'
            : riskLevel === 'medium'
              ? '近期自主神经压力和血管代谢线索提示需要复测与生活方式干预。'
              : '当前综合风险较低，建议维持周期性监测。'
    },
    evidence,
    evidenceGraph: {
      nodes: [
        { id: 'cad', label: '冠心病风险', score: Number(cadEvidence.toFixed(2)) },
        { id: 'acute', label: '急性事件', score: Number(acuteEvidence.toFixed(2)) },
        { id: 'aging', label: '血管老化', score: Number(agingEvidence.toFixed(2)) },
        { id: 'metabolic', label: '代谢压力', score: Number(metabolicEvidence.toFixed(2)) }
      ],
      references: snippets
    }
  };
}
