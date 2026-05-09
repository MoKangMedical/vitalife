import { runAnalysis } from './agents/orchestrator.js';
import { listPatients } from './data/store.js';

const patient = listPatients()[0];
const result = runAnalysis(patient, {});

if (!result.fusion?.riskPrompt?.riskLevel) {
  throw new Error('Risk prompt was not generated');
}

if (!result.agentResults.every((agent) => agent.status === 'completed' || agent.status === 'skipped')) {
  throw new Error('Agent pipeline did not complete');
}

console.log('Vitalife API smoke test passed');
