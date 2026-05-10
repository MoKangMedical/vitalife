export type RiskTier = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'female' | 'male';
  plan: string;
  riskTier: RiskTier;
  caregiver: string;
  phoneMasked: string;
  conditions: string[];
  baseline: {
    restingHr: number;
    hrv: number;
    vascularAge: number;
    faceAge: number;
    cadRisk: number;
    spo2: number;
  };
  latest: {
    heartRate: number;
    hrv: number;
    spo2: number;
    systolic: number;
    diastolic: number;
    sleepScore: number;
    steps: number;
    updatedAt: string;
  };
}

export interface Overview {
  users: number;
  highRisk: number;
  monitoredDevices: number;
  activeAgents: number;
  reusableSkills?: number;
  agentTemplates?: number;
  emergencyEvents: number;
  modules: string[];
}

export interface CapabilityLayer {
  id: string;
  name: string;
  title: string;
  summary: string;
  modules: string[];
}

export interface FoundationCapability {
  id: string;
  name: string;
  capability: string;
  status: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  scenario: string;
  skills: string[];
  outcome: string;
}

export interface CommercialPlay {
  id: string;
  name: string;
  partnerType: string;
  playbook: string;
}

export interface Differentiator {
  id: string;
  title: string;
  summary: string;
}

export interface CapabilityModel {
  positioning: string;
  layers: CapabilityLayer[];
  foundation: FoundationCapability[];
  skills: SkillDefinition[];
  agentTemplates: AgentTemplate[];
  commercialPlays: CommercialPlay[];
  differentiators: Differentiator[];
}

export interface AgentBuild {
  id: string;
  tenant: string;
  channel: string;
  status: string;
  createdAt: string;
  template: {
    id: string;
    name: string;
    scenario: string;
    outcome: string;
  };
  skills: SkillDefinition[];
  workflow: Array<{
    step: string;
    name: string;
    detail: string;
  }>;
  riskControls: string[];
  endpoints: Record<string, string>;
}

export interface ReportCard {
  id: string;
  cardCode: string;
  patientId: string;
  patientName: string;
  channel: string;
  status: string;
  redeemedAt: string;
  packageName: string;
  summary: string;
  tasks: string[];
  outputs: string[];
}

export interface DeviceEvent {
  id: string;
  patientId: string;
  patientName: string;
  deviceType: string;
  createdAt: string;
  readings: Record<string, number>;
  quality: {
    completeness: number;
    signalToNoise: number;
    motionArtifact: number;
  };
  riskFlags: string[];
  tasks: string[];
  source?: {
    provider: string;
    channel?: string;
    authorization?: string;
    recordCount?: number;
    latestAt?: string;
    sourceDevices?: string[];
    openIdMasked?: string | null;
    ingestionMode?: string;
    consentAt?: string | null;
    scopes?: string[];
  };
  stepInfoList?: Array<{
    timestamp: number;
    step: number;
  }>;
  pipeline?: HealthKitPipelineStage[];
}

export interface HealthKitPipelineStage {
  step: string;
  name: string;
  detail: string;
}

export interface HealthKitPipeline {
  provider: string;
  channel: string;
  positioning: string;
  stages: HealthKitPipelineStage[];
  supportedDataTypes: Array<{
    type: string;
    unit: string;
    vitalifeField: string;
  }>;
  controls: string[];
}

export interface MemoryEvent {
  id: string;
  patientId: string;
  type: string;
  summary: string;
  source: string;
  createdAt: string;
}

export interface PatientMemory {
  patientId: string;
  profile: {
    patientName: string;
    riskTier: RiskTier;
    caregiver: string;
    baseline: Patient['baseline'];
    latest: Patient['latest'];
  };
  events: MemoryEvent[];
  summary: {
    baselineRisk: RiskTier;
    latestVitals: string;
    continuity: string;
  };
}

export interface TimelinePoint {
  id: string;
  day: string;
  timestamp: string;
  heartRate: number;
  hrv: number;
  risk: number;
}

export interface TaskNode {
  step: string;
  label: string;
  status: 'queued' | 'running' | 'completed' | 'blocked';
}

export interface QualityVector {
  modality: string;
  score: number;
  flags: string[];
  status: 'usable' | 'review' | 'blocked';
}

export interface Evidence {
  id: string;
  riskType: string;
  source: string;
  label: string;
  value: number;
  unit: string;
  direction: 'urgent' | 'risk_up' | 'watch' | 'neutral';
  confidence: number;
  explanation: string;
  algorithm?: unknown;
}

export interface AgentResult {
  agent: string;
  status: string;
  evidence: Evidence[];
}

export interface EvidenceNode {
  id: string;
  label: string;
  score: number;
}

export interface KnowledgeReference {
  id: string;
  title: string;
  source: string;
  summary: string;
}

export interface Analysis {
  id: string;
  patient: Patient;
  taskGraph: TaskNode[];
  qualityVectors: QualityVector[];
  agentResults: AgentResult[];
  fusion: {
    agent: string;
    status: string;
    riskPrompt: {
      patientId: string;
      generatedAt: string;
      riskLevel: RiskLevel;
      riskScore: number;
      emergencyFlag: boolean;
      vascularAgeDelta: number;
      agingIndex: number;
      clinicalRiskPercent?: number | null;
      clinicalAlgorithms?: Array<{
        algorithm: string;
        status: string;
        category: string | null;
        value: number | null;
        unit: string | null;
        source: string;
      }>;
      summary: string;
    };
    evidence: Evidence[];
    evidenceGraph: {
      nodes: EvidenceNode[];
      references: KnowledgeReference[];
    };
  };
  coach: {
    agent: string;
    status: string;
    actionList: string[];
    tone: 'coach' | 'emergency';
    message: string;
  };
}

export interface EmergencyEvent {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  status: string;
  riskPrompt: Analysis['fusion']['riskPrompt'];
  actionList: string[];
}
