import { buildQualityVector } from './quality.js';
import { runFaceAgent } from './faceAgent.js';
import { runSignalAgent } from './signalAgent.js';
import { runReportAgent } from './reportAgent.js';
import { runGenomicAgent } from './genomicAgent.js';
import { runFusionAgent } from './fusionAgent.js';
import { runCoachAgent } from './coachAgent.js';
import { getKnowledgeSnippets } from '../data/store.js';

export function runAnalysis(patient, payload = {}) {
  const qualityVectors = [
    buildQualityVector('face', payload.quality?.face),
    buildQualityVector('signal', payload.quality?.signal),
    buildQualityVector('report', payload.quality?.report),
    buildQualityVector('genomic', payload.quality?.genomic)
  ];

  const taskGraph = [
    { step: 'S101', label: '采集多模态数据', status: 'completed' },
    { step: 'S103', label: '质量控制与预处理', status: 'completed' },
    { step: 'S105', label: '任务编排', status: 'completed' },
    { step: 'S106', label: '专家智能体并行分析', status: 'completed' },
    { step: 'S108', label: '构建证据图谱', status: 'completed' },
    { step: 'S109', label: '融合仲裁', status: 'completed' },
    { step: 'S110', label: '输出健康管理结果', status: 'completed' }
  ];

  const results = [
    runFaceAgent(patient, payload.face),
    runSignalAgent(patient, payload.signal),
    runReportAgent(patient, payload.report),
    runGenomicAgent(patient, payload.genomic)
  ];
  const fusion = runFusionAgent(patient, results, qualityVectors, getKnowledgeSnippets());
  const coach = runCoachAgent(fusion);

  return {
    id: `analysis-${patient.id}-${Date.now()}`,
    patient,
    taskGraph,
    qualityVectors,
    agentResults: results,
    fusion,
    coach
  };
}
