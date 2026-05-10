const CHOLESTEROL_MMOL_TO_MGDL = 38.67;
const GLUCOSE_MMOL_TO_MGDL = 18.0182;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function toMgDl(value, analyte = 'cholesterol') {
  if (value == null || Number.isNaN(Number(value))) return null;
  const number = Number(value);
  return analyte === 'glucose' ? number * GLUCOSE_MMOL_TO_MGDL : number * CHOLESTEROL_MMOL_TO_MGDL;
}

const pceCoefficients = {
  white_female: {
    baselineSurvival: 0.9665,
    meanCoefficientSum: -29.18,
    terms: {
      lnAge: -29.799,
      lnAgeSquared: 4.884,
      lnTotalCholesterol: 13.54,
      lnAgeLnTotalCholesterol: -3.114,
      lnHdl: -13.578,
      lnAgeLnHdl: 3.149,
      lnTreatedSbp: 2.019,
      lnUntreatedSbp: 1.957,
      smoker: 7.574,
      lnAgeSmoker: -1.665,
      diabetes: 0.661
    }
  },
  black_female: {
    baselineSurvival: 0.9533,
    meanCoefficientSum: 86.61,
    terms: {
      lnAge: 17.114,
      lnTotalCholesterol: 0.94,
      lnHdl: -18.92,
      lnAgeLnHdl: 4.475,
      lnTreatedSbp: 29.291,
      lnAgeLnTreatedSbp: -6.432,
      lnUntreatedSbp: 27.82,
      lnAgeLnUntreatedSbp: -6.087,
      smoker: 0.691,
      diabetes: 0.874
    }
  },
  white_male: {
    baselineSurvival: 0.9144,
    meanCoefficientSum: 61.18,
    terms: {
      lnAge: 12.344,
      lnTotalCholesterol: 11.853,
      lnAgeLnTotalCholesterol: -2.664,
      lnHdl: -7.99,
      lnAgeLnHdl: 1.769,
      lnTreatedSbp: 1.797,
      lnUntreatedSbp: 1.764,
      smoker: 7.837,
      lnAgeSmoker: -1.795,
      diabetes: 0.658
    }
  },
  black_male: {
    baselineSurvival: 0.8954,
    meanCoefficientSum: 19.54,
    terms: {
      lnAge: 2.469,
      lnTotalCholesterol: 0.302,
      lnHdl: -0.307,
      lnTreatedSbp: 1.916,
      lnUntreatedSbp: 1.809,
      smoker: 0.549,
      diabetes: 0.645
    }
  }
};

function pceModelKey({ sex, race }) {
  const sexKey = sex === 'female' ? 'female' : 'male';
  const raceKey = race === 'black' || race === 'african_american' ? 'black' : 'white';
  return `${raceKey}_${sexKey}`;
}

function coefficientSum(model, values) {
  const terms = model.terms;
  const lnAge = Math.log(values.age);
  const lnTotalCholesterol = Math.log(values.totalCholesterolMgDl);
  const lnHdl = Math.log(values.hdlMgDl);
  const lnSbp = Math.log(values.systolicBp);
  const treated = Boolean(values.treatedBp);

  let sum = 0;
  sum += (terms.lnAge ?? 0) * lnAge;
  sum += (terms.lnAgeSquared ?? 0) * lnAge * lnAge;
  sum += (terms.lnTotalCholesterol ?? 0) * lnTotalCholesterol;
  sum += (terms.lnAgeLnTotalCholesterol ?? 0) * lnAge * lnTotalCholesterol;
  sum += (terms.lnHdl ?? 0) * lnHdl;
  sum += (terms.lnAgeLnHdl ?? 0) * lnAge * lnHdl;

  if (treated) {
    sum += (terms.lnTreatedSbp ?? 0) * lnSbp;
    sum += (terms.lnAgeLnTreatedSbp ?? 0) * lnAge * lnSbp;
  } else {
    sum += (terms.lnUntreatedSbp ?? 0) * lnSbp;
    sum += (terms.lnAgeLnUntreatedSbp ?? 0) * lnAge * lnSbp;
  }

  if (values.smoker) {
    sum += (terms.smoker ?? 0);
    sum += (terms.lnAgeSmoker ?? 0) * lnAge;
  }

  if (values.diabetes) {
    sum += (terms.diabetes ?? 0);
  }

  return sum;
}

export function calculatePooledCohortAscvdRisk(input) {
  const required = ['age', 'sex', 'totalCholesterolMgDl', 'hdlMgDl', 'systolicBp'];
  const missing = required.filter((key) => input[key] == null || input[key] === '');
  if (missing.length) {
    return {
      algorithm: 'ACC/AHA Pooled Cohort Equations',
      status: 'insufficient_data',
      missing,
      source: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk'
    };
  }

  const age = Number(input.age);
  if (age < 40 || age > 79) {
    return {
      algorithm: 'ACC/AHA Pooled Cohort Equations',
      status: 'out_of_range',
      reason: 'PCE 10年ASCVD风险方程适用于40-79岁成人。',
      source: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk'
    };
  }

  const modelKey = pceModelKey(input);
  const model = pceCoefficients[modelKey];
  const values = {
    age,
    totalCholesterolMgDl: Number(input.totalCholesterolMgDl),
    hdlMgDl: Number(input.hdlMgDl),
    systolicBp: Number(input.systolicBp),
    treatedBp: Boolean(input.treatedBp),
    smoker: Boolean(input.smoker),
    diabetes: Boolean(input.diabetes)
  };

  const sum = coefficientSum(model, values);
  const risk = 1 - model.baselineSurvival ** Math.exp(sum - model.meanCoefficientSum);
  const percent = round(clamp(risk, 0, 1) * 100, 1);

  return {
    algorithm: 'ACC/AHA Pooled Cohort Equations',
    status: 'computed',
    model: modelKey,
    value: percent,
    unit: '%',
    category: percent >= 20 ? 'high' : percent >= 7.5 ? 'intermediate' : percent >= 5 ? 'borderline' : 'low',
    inputs: values,
    source: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk'
  };
}

export function classifyBloodPressure(systolic, diastolic) {
  const sbp = Number(systolic);
  const dbp = Number(diastolic);
  if (!Number.isFinite(sbp) || !Number.isFinite(dbp)) {
    return { status: 'insufficient_data', missing: ['systolic', 'diastolic'] };
  }

  let category = 'normal';
  let label = '正常血压';
  if (sbp >= 180 || dbp >= 120) {
    category = 'hypertensive_crisis_range';
    label = '达到高血压危象读数范围';
  } else if (sbp >= 140 || dbp >= 90) {
    category = 'stage_2_hypertension';
    label = '2级高血压范围';
  } else if ((sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89)) {
    category = 'stage_1_hypertension';
    label = '1级高血压范围';
  } else if (sbp >= 120 && sbp <= 129 && dbp < 80) {
    category = 'elevated';
    label = '血压升高范围';
  }

  return {
    algorithm: 'ACC/AHA 2017 Blood Pressure Categories',
    status: 'computed',
    category,
    label,
    systolic: sbp,
    diastolic: dbp,
    source: '2017 ACC/AHA High Blood Pressure Guideline'
  };
}

export function classifyFastingGlucose({ glucoseMmolL, glucoseMgDl, hba1c }) {
  const fpg = glucoseMgDl ?? toMgDl(glucoseMmolL, 'glucose');
  const a1c = hba1c == null ? null : Number(hba1c);
  if (fpg == null && a1c == null) {
    return { status: 'insufficient_data', missing: ['fasting_glucose_or_hba1c'] };
  }

  let category = 'normal';
  let label = '糖代谢正常范围';
  if ((fpg != null && fpg >= 126) || (a1c != null && a1c >= 6.5)) {
    category = 'diabetes_range';
    label = '达到糖尿病诊断读数范围，需复测或医生确认';
  } else if ((fpg != null && fpg >= 100) || (a1c != null && a1c >= 5.7)) {
    category = 'prediabetes_range';
    label = '糖尿病前期读数范围';
  }

  return {
    algorithm: 'ADA Standards of Care Glycemic Criteria',
    status: 'computed',
    category,
    label,
    fastingGlucoseMgDl: fpg == null ? null : round(fpg, 0),
    hba1c: a1c,
    source: 'American Diabetes Association Standards of Care'
  };
}

export function classifyLdl(ldlMmolL) {
  const ldlMgDl = toMgDl(ldlMmolL, 'cholesterol');
  if (ldlMgDl == null) return { status: 'insufficient_data', missing: ['ldl'] };

  let category = 'optimal_or_near_optimal';
  let label = 'LDL-C未达到明显升高阈值';
  if (ldlMgDl >= 190) {
    category = 'severe_hypercholesterolemia_range';
    label = 'LDL-C达到严重升高范围';
  } else if (ldlMgDl >= 160) {
    category = 'high';
    label = 'LDL-C升高';
  } else if (ldlMgDl >= 130) {
    category = 'borderline_high';
    label = 'LDL-C边缘升高';
  }

  return {
    algorithm: 'Adult lipid threshold classification',
    status: 'computed',
    category,
    label,
    ldlMmolL: Number(ldlMmolL),
    ldlMgDl: round(ldlMgDl, 0),
    source: 'ACC/AHA cholesterol risk management thresholds'
  };
}

export function triageVitalSigns({ heartRate, spo2 }) {
  const hr = Number(heartRate);
  const oxygen = Number(spo2);
  const flags = [];

  if (Number.isFinite(hr)) {
    if (hr >= 135 || hr <= 45) {
      flags.push({ id: 'heart-rate-critical', severity: 'urgent', label: '心率处于急性复核阈值' });
    } else if (hr > 100 || hr < 60) {
      flags.push({ id: 'heart-rate-abnormal', severity: 'watch', label: '静息心率超出成人常见范围' });
    }
  }

  if (Number.isFinite(oxygen)) {
    if (oxygen < 90) {
      flags.push({ id: 'spo2-critical', severity: 'urgent', label: '血氧低于90%，需立即复核' });
    } else if (oxygen < 95) {
      flags.push({ id: 'spo2-low', severity: 'watch', label: '血氧低于95%，建议复测' });
    }
  }

  return {
    algorithm: 'Vital sign threshold triage',
    status: 'computed',
    severity: flags.some((flag) => flag.severity === 'urgent') ? 'urgent' : flags.some((flag) => flag.severity === 'watch') ? 'watch' : 'normal',
    flags,
    source: 'AHA resting heart rate guidance and clinical oxygen saturation triage thresholds'
  };
}

export function calculateHrvDeviation(currentHrv, baselineHrv) {
  const current = Number(currentHrv);
  const baseline = Number(baselineHrv);
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline <= 0) {
    return { status: 'insufficient_data', missing: ['current_hrv_or_baseline_hrv'] };
  }
  const percentDrop = ((baseline - current) / baseline) * 100;
  return {
    algorithm: 'Personal baseline HRV deviation',
    status: 'computed',
    current,
    baseline,
    percentDrop: round(percentDrop, 1),
    category: percentDrop >= 30 ? 'large_drop' : percentDrop >= 15 ? 'moderate_drop' : 'stable',
    source: 'Individual longitudinal baseline comparison'
  };
}
