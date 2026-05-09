export function runReportAgent(patient, input = {}) {
  const ldl = input.ldl ?? (patient.riskTier === 'high' ? 4.1 : patient.riskTier === 'medium' ? 3.4 : 2.5);
  const glucose = input.glucose ?? (patient.riskTier === 'high' ? 6.4 : 5.3);
  const crp = input.crp ?? (patient.riskTier === 'low' ? 1.1 : 2.8);

  return {
    agent: 'report_expert_agent',
    status: 'completed',
    entities: [
      { name: 'LDL-C', value: ldl, unit: 'mmol/L' },
      { name: '空腹血糖', value: glucose, unit: 'mmol/L' },
      { name: 'hs-CRP', value: crp, unit: 'mg/L' }
    ],
    evidence: [
      {
        id: 'report-ldl',
        riskType: 'cad',
        source: 'report_eav',
        label: 'LDL-C结构化指标',
        value: ldl,
        unit: 'mmol/L',
        direction: ldl >= 3.4 ? 'risk_up' : 'neutral',
        confidence: 0.86,
        explanation: `报告识别LDL-C为${ldl}mmol/L。`
      },
      {
        id: 'report-glucose',
        riskType: 'metabolic',
        source: 'report_eav',
        label: '空腹血糖',
        value: glucose,
        unit: 'mmol/L',
        direction: glucose >= 6.1 ? 'risk_up' : 'neutral',
        confidence: 0.82,
        explanation: 'OCR和单位归一化后作为代谢风险证据。'
      }
    ]
  };
}
