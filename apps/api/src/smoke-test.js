import { runAnalysis } from './agents/orchestrator.js';
import { listPatients } from './data/store.js';
import { createHealthKitDeviceEvent, demoHealthKitSamples } from './integrations/healthKit.js';
import { createWeRunDeviceEvent, demoWeRunStepInfo } from './integrations/wechat.js';
import { calculatePooledCohortAscvdRisk, classifyBloodPressure, classifyFastingGlucose } from './medical/algorithms.js';

const patient = listPatients()[0];
const result = runAnalysis(patient, {
  report: {
    totalCholesterolMgDl: 212,
    hdlMgDl: 48,
    ldl: 3.4,
    glucose: 5.8,
    hba1c: 5.8,
    treatedBp: true,
    smoker: false,
    diabetes: false
  }
});

if (!result.fusion?.riskPrompt?.riskLevel) {
  throw new Error('Risk prompt was not generated');
}

if (!result.agentResults.every((agent) => agent.status === 'completed' || agent.status === 'skipped')) {
  throw new Error('Agent pipeline did not complete');
}

const pce = calculatePooledCohortAscvdRisk({
  age: 55,
  sex: 'male',
  totalCholesterolMgDl: 213,
  hdlMgDl: 50,
  systolicBp: 120,
  treatedBp: false,
  smoker: false,
  diabetes: false
});

if (pce.status !== 'computed' || typeof pce.value !== 'number') {
  throw new Error('PCE ASCVD risk was not computed');
}

if (classifyBloodPressure(142, 92).category !== 'stage_2_hypertension') {
  throw new Error('Blood pressure classification failed');
}

if (classifyFastingGlucose({ glucoseMmolL: 6.1 }).category !== 'prediabetes_range') {
  throw new Error('Glucose classification failed');
}

const weRunEvent = createWeRunDeviceEvent(patient, demoWeRunStepInfo(patient), { ingestionMode: 'smoke_test' });
if (weRunEvent.deviceType !== 'wechat_werun' || !weRunEvent.readings.steps7dAvg) {
  throw new Error('WeRun activity event was not normalized');
}

const healthKitEvent = createHealthKitDeviceEvent(patient, {
  authorization: { scopes: ['healthkit.activity', 'healthkit.heart'], consentAt: new Date().toISOString() },
  samples: demoHealthKitSamples(patient)
});
if (healthKitEvent.deviceType !== 'huawei_health_kit' || !healthKitEvent.readings.heartRate) {
  throw new Error('Huawei Health Kit event was not normalized');
}

console.log('Vitalife API smoke test passed');
