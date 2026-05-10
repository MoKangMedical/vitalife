import {
  calculatePooledCohortAscvdRisk,
  classifyFastingGlucose,
  classifyLdl
} from '../medical/algorithms.js';

export function runReportAgent(patient, input = {}) {
  const ldl = input.ldl ?? (patient.riskTier === 'high' ? 4.1 : patient.riskTier === 'medium' ? 3.4 : 2.5);
  const glucose = input.glucose ?? (patient.riskTier === 'high' ? 6.4 : 5.3);
  const crp = input.crp ?? (patient.riskTier === 'low' ? 1.1 : 2.8);
  const totalCholesterolMgDl = input.totalCholesterolMgDl ?? input.totalCholesterol;
  const hdlMgDl = input.hdlMgDl ?? input.hdl;
  const ldlClassification = classifyLdl(ldl);
  const glucoseClassification = classifyFastingGlucose({ glucoseMmolL: glucose, hba1c: input.hba1c });
  const ascvd = calculatePooledCohortAscvdRisk({
    age: patient.age,
    sex: patient.sex,
    race: input.race ?? patient.race ?? 'white',
    totalCholesterolMgDl,
    hdlMgDl,
    systolicBp: input.systolicBp ?? patient.latest.systolic,
    treatedBp: input.treatedBp ?? patient.conditions.some((condition) => condition.includes('高血压')),
    smoker: input.smoker ?? false,
    diabetes: input.diabetes ?? glucoseClassification.category === 'diabetes_range'
  });

  const evidence = [
    {
      id: 'report-ldl',
      riskType: 'cad',
      source: 'report_eav',
      label: 'LDL-C结构化指标',
      value: ldl,
      unit: 'mmol/L',
      direction: ['borderline_high', 'high', 'severe_hypercholesterolemia_range'].includes(ldlClassification.category)
        ? 'risk_up'
        : 'neutral',
      confidence: 0.86,
      explanation: `${ldlClassification.label}：LDL-C ${ldl}mmol/L（约${ldlClassification.ldlMgDl ?? '--'}mg/dL）。`,
      algorithm: ldlClassification
    },
    {
      id: 'report-glucose',
      riskType: 'metabolic',
      source: 'report_eav',
      label: '空腹血糖/糖化血红蛋白',
      value: glucoseClassification.fastingGlucoseMgDl ?? glucose,
      unit: glucoseClassification.fastingGlucoseMgDl ? 'mg/dL' : 'mmol/L',
      direction: ['prediabetes_range', 'diabetes_range'].includes(glucoseClassification.category) ? 'risk_up' : 'neutral',
      confidence: 0.82,
      explanation: `${glucoseClassification.label}。`,
      algorithm: glucoseClassification
    }
  ];

  if (ascvd.status === 'computed') {
    evidence.unshift({
      id: 'report-ascvd-pce',
      riskType: 'cad',
      source: 'pooled_cohort_equations',
      label: '10年ASCVD风险',
      value: ascvd.value,
      unit: '%',
      direction: ['intermediate', 'high'].includes(ascvd.category) ? 'risk_up' : ascvd.category === 'borderline' ? 'watch' : 'neutral',
      confidence: 0.9,
      explanation: `ACC/AHA PCE 10年ASCVD风险为${ascvd.value}%，分层为${ascvd.category}。`,
      algorithm: ascvd
    });
  }

  return {
    agent: 'report_expert_agent',
    status: 'completed',
    entities: [
      { name: 'LDL-C', value: ldl, unit: 'mmol/L' },
      { name: '空腹血糖', value: glucose, unit: 'mmol/L' },
      { name: '总胆固醇', value: totalCholesterolMgDl ?? null, unit: 'mg/dL' },
      { name: 'HDL-C', value: hdlMgDl ?? null, unit: 'mg/dL' },
      { name: 'hs-CRP', value: crp, unit: 'mg/L' }
    ],
    algorithms: [ascvd, ldlClassification, glucoseClassification],
    evidence
  };
}
