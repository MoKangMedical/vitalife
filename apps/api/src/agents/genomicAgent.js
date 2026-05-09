export function runGenomicAgent(patient, input = {}) {
  const prs = input.prs ?? (patient.riskTier === 'high' ? 0.72 : patient.riskTier === 'medium' ? 0.48 : 0.22);
  const agingSusceptibility = input.agingSusceptibility ?? (patient.baseline.faceAge - patient.age > 4 ? 0.64 : 0.31);

  return {
    agent: 'genomic_expert_agent',
    status: input.available === false ? 'skipped' : 'completed',
    evidence:
      input.available === false
        ? []
        : [
            {
              id: 'genomic-prs',
              riskType: 'cad',
              source: 'genomic_variant_set',
              label: '冠心病多基因风险评分',
              value: prs,
              unit: 'percentile',
              direction: prs > 0.65 ? 'risk_up' : 'neutral',
              confidence: 0.71,
              explanation: '基于已授权遗传位点集合计算PRS百分位。'
            },
            {
              id: 'genomic-aging',
              riskType: 'vascular_aging',
              source: 'genomic_variant_set',
              label: '衰老易感性证据',
              value: agingSusceptibility,
              unit: 'score',
              direction: agingSusceptibility > 0.58 ? 'risk_up' : 'neutral',
              confidence: 0.66,
              explanation: '与面部生物学年龄偏离共同参与交叉验证。'
            }
          ]
  };
}
