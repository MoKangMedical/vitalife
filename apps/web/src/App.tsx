import {
  Activity,
  AlertTriangle,
  BellRing,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  MonitorSmartphone,
  Network,
  RadioTower,
  SearchCheck,
  Settings,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  UsersRound,
  Watch,
  Workflow
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { fetchOverview, fetchPatient, fetchPatients, fetchTimeline, runAnalysis, simulateEmergency } from './lib/api';
import type { Analysis, EmergencyEvent, Overview, Patient, RiskLevel, RiskTier, TimelinePoint } from './lib/types';

type ViewId = 'overview' | 'capture' | 'agents' | 'reports' | 'clinician' | 'emergency' | 'settings';

const navigation: Array<{ id: ViewId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: '健康总览', icon: LayoutDashboard },
  { id: 'capture', label: '多模态采集', icon: Camera },
  { id: 'agents', label: '智能体分析', icon: BrainCircuit },
  { id: 'reports', label: '报告中心', icon: FileText },
  { id: 'clinician', label: '医生运营台', icon: Stethoscope },
  { id: 'emergency', label: '急救联动', icon: BellRing },
  { id: 'settings', label: '系统设置', icon: Settings }
];

const riskLabels: Record<RiskLevel | RiskTier, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  urgent: '紧急'
};

function riskClass(level: RiskLevel | RiskTier) {
  return `risk ${level}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function agentName(name: string) {
  const map: Record<string, string> = {
    facecv_expert_agent: '面部视觉专家',
    signals_expert_agent: 'PPG/ECG信号专家',
    report_expert_agent: '报告解读专家',
    genomic_expert_agent: '遗传风险专家',
    comprehensive_analysis_agent: '融合仲裁智能体',
    user_interaction_agent: '用户交互智能体'
  };
  return map[name] ?? name;
}

function modalityName(name: string) {
  const map: Record<string, string> = {
    face: '面部视觉',
    signal: 'PPG/ECG信号',
    report: '体检报告',
    genomic: '遗传PRS'
  };
  return map[name] ?? name;
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [running, setRunning] = useState(false);
  const [emergency, setEmergency] = useState<EmergencyEvent | null>(null);

  useEffect(() => {
    void Promise.all([fetchOverview(), fetchPatients()]).then(([nextOverview, nextPatients]) => {
      setOverview(nextOverview);
      setPatients(nextPatients);
      setSelectedPatientId((current) => current || nextPatients[0]?.id || '');
    });
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;
    void Promise.all([fetchPatient(selectedPatientId), fetchTimeline(selectedPatientId)]).then(([detail, series]) => {
      setAnalysis(detail.analysis);
      setTimeline(series);
    });
  }, [selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId]
  );

  async function handleRunAnalysis() {
    if (!selectedPatient) return;
    setRunning(true);
    try {
      const nextAnalysis = await runAnalysis(selectedPatient);
      setAnalysis(nextAnalysis);
      setActiveView('agents');
    } finally {
      setRunning(false);
    }
  }

  async function handleEmergency() {
    if (!selectedPatient) return;
    setRunning(true);
    try {
      const result = await simulateEmergency(selectedPatient.id, selectedPatient);
      setEmergency(result.event);
      setAnalysis(result.analysis);
      setActiveView('emergency');
    } finally {
      setRunning(false);
    }
  }

  const content = (() => {
    if (!selectedPatient || !overview) return <LoadingState />;
    switch (activeView) {
      case 'overview':
        return (
          <OverviewPage
            analysis={analysis}
            overview={overview}
            patient={selectedPatient}
            running={running}
            series={timeline}
            onEmergency={handleEmergency}
            onRunAnalysis={handleRunAnalysis}
            onViewChange={setActiveView}
          />
        );
      case 'capture':
        return <CapturePage patient={selectedPatient} onRunAnalysis={handleRunAnalysis} running={running} />;
      case 'agents':
        return <AgentStudio analysis={analysis} patient={selectedPatient} running={running} onRunAnalysis={handleRunAnalysis} />;
      case 'reports':
        return <ReportsPage analysis={analysis} patient={selectedPatient} series={timeline} />;
      case 'clinician':
        return (
          <ClinicianConsole
            analysis={analysis}
            patients={patients}
            selectedPatientId={selectedPatient.id}
            onSelectPatient={setSelectedPatientId}
          />
        );
      case 'emergency':
        return (
          <EmergencyPage
            analysis={analysis}
            emergency={emergency}
            patient={selectedPatient}
            running={running}
            onSimulate={handleEmergency}
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  })();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <HeartPulse size={24} aria-hidden />
          </div>
          <div>
            <strong>Vitalife</strong>
            <span>心血管与抗衰Agent</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="主导航">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? 'nav-item active' : 'nav-item'}
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <Icon size={18} aria-hidden />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <div className="status-dot" />
          <span>本地演示环境</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">多平台一体化健康管理</span>
            <h1>{navigation.find((item) => item.id === activeView)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <label className="patient-picker">
              <UsersRound size={16} aria-hidden />
              <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} · {patient.age}岁
                  </option>
                ))}
              </select>
            </label>
            <button className="button ghost" onClick={handleEmergency} type="button">
              <BellRing size={17} aria-hidden />
              急救演练
            </button>
            <button className="button primary" disabled={running || !selectedPatient} onClick={handleRunAnalysis} type="button">
              {running ? <Loader2 className="spin" size={17} aria-hidden /> : <BrainCircuit size={17} aria-hidden />}
              运行智能体
            </button>
          </div>
        </header>
        <section className="view-surface">{content}</section>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <Loader2 className="spin" size={28} aria-hidden />
      <span>正在加载Vitalife平台数据</span>
    </div>
  );
}

function OverviewPage({
  analysis,
  overview,
  patient,
  running,
  series,
  onEmergency,
  onRunAnalysis,
  onViewChange
}: {
  analysis: Analysis | null;
  overview: Overview;
  patient: Patient;
  running: boolean;
  series: TimelinePoint[];
  onEmergency: () => void;
  onRunAnalysis: () => void;
  onViewChange: (view: ViewId) => void;
}) {
  const prompt = analysis?.fusion.riskPrompt;
  const riskScore = prompt?.riskScore ?? (patient.riskTier === 'high' ? 72 : patient.riskTier === 'medium' ? 52 : 25);
  const riskLevel = prompt?.riskLevel ?? patient.riskTier;

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className={riskClass(riskLevel)}>{riskLabels[riskLevel]}</span>
          <h2>{patient.name} 综合健康监测</h2>
          <p>{prompt?.summary ?? '待运行智能体后生成融合风险摘要。当前展示来自基线档案与最近一次设备采集。'}</p>
          <div className="hero-actions">
            <button className="button primary" disabled={running} onClick={onRunAnalysis} type="button">
              {running ? <Loader2 className="spin" size={17} aria-hidden /> : <Workflow size={17} aria-hidden />}
              生成本次分析
            </button>
            <button className="button danger" onClick={onEmergency} type="button">
              <AlertTriangle size={17} aria-hidden />
              模拟急性预警
            </button>
          </div>
        </div>
        <RiskGauge level={riskLevel} score={riskScore} />
      </section>

      <section className="metric-grid">
        <MetricCard icon={UsersRound} label="在管用户" value={overview.users} suffix="人" />
        <MetricCard icon={AlertTriangle} label="高风险队列" value={overview.highRisk} suffix="人" tone="warn" />
        <MetricCard icon={Watch} label="连接设备" value={overview.monitoredDevices} suffix="台" />
        <MetricCard icon={BrainCircuit} label="活跃智能体" value={overview.activeAgents} suffix="个" />
      </section>

      <section className="panel wide">
        <PanelHeader icon={LineChart} title="7日趋势" action="心率 / HRV / 风险" />
        <TrendChart series={series} />
      </section>

      <section className="panel">
        <PanelHeader icon={Activity} title="实时体征" action={formatDateTime(patient.latest.updatedAt)} />
        <div className="vitals-grid">
          <VitalTile label="心率" value={patient.latest.heartRate} unit="bpm" />
          <VitalTile label="HRV" value={patient.latest.hrv} unit="ms" />
          <VitalTile label="血氧" value={patient.latest.spo2} unit="%" />
          <VitalTile label="血压" value={`${patient.latest.systolic}/${patient.latest.diastolic}`} unit="mmHg" />
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={Network} title="证据图谱" action="融合仲裁" />
        <EvidenceGraph analysis={analysis} />
      </section>

      <section className="panel wide">
        <PanelHeader icon={ClipboardCheck} title="闭环任务" action="用户端与照护端同步" />
        <ActionList analysis={analysis} />
        <div className="module-row">
          {overview.modules.map((module) => (
            <button className="module-chip" key={module} onClick={() => onViewChange(module === '专家智能体' ? 'agents' : 'capture')} type="button">
              {module}
              <ChevronRight size={14} aria-hidden />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function CapturePage({ patient, running, onRunAnalysis }: { patient: Patient; running: boolean; onRunAnalysis: () => void }) {
  const [captureProgress, setCaptureProgress] = useState(62);

  function startCapture() {
    setCaptureProgress(0);
    const timer = window.setInterval(() => {
      setCaptureProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return Math.min(100, value + 8);
      });
    }, 220);
  }

  return (
    <div className="two-column">
      <section className="panel">
        <PanelHeader icon={Camera} title="端侧采集" action="FaceAge / CAD视觉风险" />
        <div className="capture-frame">
          <div className="face-mask">
            <div />
            <span>ROI</span>
          </div>
          <ul className="capture-checks">
            <li>
              <CheckCircle2 size={16} aria-hidden />
              人脸居中，额头与面颊区域完整
            </li>
            <li>
              <CheckCircle2 size={16} aria-hidden />
              光照评分 0.88，模糊度 0.12
            </li>
            <li>
              <CheckCircle2 size={16} aria-hidden />
              端侧脱敏后仅上传特征向量
            </li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={HeartPulse} title="掌腹PPG复测" action={`${captureProgress}%`} />
        <div className="progress-ring" style={{ '--progress': `${captureProgress}%` } as CSSProperties}>
          <strong>{captureProgress}%</strong>
          <span>60秒窗口</span>
        </div>
        <div className="button-row">
          <button className="button primary" onClick={startCapture} type="button">
            <RadioTower size={17} aria-hidden />
            开始采集
          </button>
          <button className="button ghost" disabled={running} onClick={onRunAnalysis} type="button">
            <BrainCircuit size={17} aria-hidden />
            分析窗口
          </button>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={UploadCloud} title="报告与基因" action="OCR + PRS" />
        <div className="upload-list">
          <UploadItem title="体检报告OCR" status="LDL-C、HbA1c、hsCRP已解析" />
          <UploadItem title="基因PRS文件" status={`${patient.name} 的冠心病PRS可用`} />
          <UploadItem title="用药与病史" status={patient.conditions.join(' / ')} />
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={LockKeyhole} title="隐私与合规" action="端云协同" />
        <div className="privacy-list">
          <div>
            <ShieldCheck size={18} aria-hidden />
            <span>生物特征本地预处理</span>
          </div>
          <div>
            <DatabaseZap size={18} aria-hidden />
            <span>证据摘要进入审计日志</span>
          </div>
          <div>
            <MonitorSmartphone size={18} aria-hidden />
            <span>老人端、家属端、医生端权限隔离</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function AgentStudio({
  analysis,
  patient,
  running,
  onRunAnalysis
}: {
  analysis: Analysis | null;
  patient: Patient;
  running: boolean;
  onRunAnalysis: () => void;
}) {
  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={Workflow} title="任务编排流程" action={analysis ? analysis.id : '等待运行'} />
        {analysis ? (
          <div className="task-flow">
            {analysis.taskGraph.map((task) => (
              <div className="task-node" key={task.step}>
                <span>{task.step}</span>
                <strong>{task.label}</strong>
                <small>{task.status === 'completed' ? '完成' : task.status}</small>
              </div>
            ))}
          </div>
        ) : (
          <EmptyAction label="还没有本次分析结果" action="运行智能体" onClick={onRunAnalysis} />
        )}
      </section>

      <section className="panel">
        <PanelHeader icon={SearchCheck} title="质量控制向量" action="低质数据降权" />
        <div className="quality-list">
          {(analysis?.qualityVectors ?? []).map((quality) => (
            <div className="quality-item" key={quality.modality}>
              <div>
                <strong>{modalityName(quality.modality)}</strong>
                <span>{quality.flags.join('、')}</span>
              </div>
              <meter min={0} max={1} value={quality.score} />
            </div>
          ))}
          {!analysis && <p className="muted">运行后展示各模态可用性、置信度与降权原因。</p>}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={BrainCircuit} title="RiskPrompt" action={patient.id} />
        <pre className="prompt-box">
          {JSON.stringify(
            analysis?.fusion.riskPrompt ?? {
              patientId: patient.id,
              status: 'pending',
              inputs: ['face_roi_vector', 'ppg_series', 'ocr_report', 'genomic_prs']
            },
            null,
            2
          )}
        </pre>
      </section>

      <section className="panel wide">
        <PanelHeader icon={Network} title="专家智能体证据" action="并行分析 + 融合仲裁" />
        <div className="evidence-table">
          <div className="table-head">
            <span>智能体</span>
            <span>证据</span>
            <span>方向</span>
            <span>置信度</span>
          </div>
          {(analysis?.agentResults ?? []).flatMap((result) =>
            result.evidence.map((evidence) => (
              <div className="table-row" key={`${result.agent}-${evidence.id}`}>
                <span>{agentName(result.agent)}</span>
                <span>
                  <strong>{evidence.label}</strong>
                  <small>{evidence.explanation}</small>
                </span>
                <span className={`direction ${evidence.direction}`}>{evidence.direction}</span>
                <span>{Math.round(evidence.confidence * 100)}%</span>
              </div>
            ))
          )}
          {!analysis && <EmptyAction label="暂无证据表" action="开始分析" onClick={onRunAnalysis} />}
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader icon={MessageSquareText} title="交互智能体输出" action={analysis?.coach.tone ?? 'coach'} />
        <ActionList analysis={analysis} />
        <div className="button-row">
          <button className="button primary" disabled={running} onClick={onRunAnalysis} type="button">
            {running ? <Loader2 className="spin" size={17} aria-hidden /> : <BrainCircuit size={17} aria-hidden />}
            重新运行
          </button>
        </div>
      </section>
    </div>
  );
}

function ReportsPage({
  analysis,
  patient,
  series
}: {
  analysis: Analysis | null;
  patient: Patient;
  series: TimelinePoint[];
}) {
  const prompt = analysis?.fusion.riskPrompt;
  return (
    <div className="two-column">
      <section className="report-sheet">
        <div className="report-heading">
          <span>Vitalife 周期健康报告</span>
          <h2>{patient.name} · 心血管与抗衰综合评估</h2>
          <p>报告对象：{patient.age}岁 · 方案：{patient.plan} · 照护人：{patient.caregiver}</p>
        </div>
        <div className="report-summary">
          <div>
            <span>综合风险分</span>
            <strong>{prompt?.riskScore ?? '--'}</strong>
          </div>
          <div>
            <span>血管年龄偏离</span>
            <strong>{prompt ? `+${prompt.vascularAgeDelta}岁` : '--'}</strong>
          </div>
          <div>
            <span>最近血压</span>
            <strong>
              {patient.latest.systolic}/{patient.latest.diastolic}
            </strong>
          </div>
        </div>
        <h3>融合结论</h3>
        <p>{prompt?.summary ?? '请先运行智能体分析，生成本次融合结论。'}</p>
        <h3>重点干预</h3>
        <ActionList analysis={analysis} />
        <h3>趋势摘要</h3>
        <TrendChart compact series={series} />
      </section>

      <section className="panel">
        <PanelHeader icon={FileText} title="报告操作" action="医生复核后发布" />
        <div className="operation-list">
          <OperationItem title="医生复核" detail="高风险与急性预警报告需人工确认" />
          <OperationItem title="家属同步" detail="发送摘要、复测任务和紧急联系人状态" />
          <OperationItem title="导出归档" detail="生成PDF并写入审计日志" />
        </div>
        <button className="button primary full" type="button">
          <ClipboardCheck size={17} aria-hidden />
          标记待医生复核
        </button>
      </section>
    </div>
  );
}

function ClinicianConsole({
  analysis,
  patients,
  selectedPatientId,
  onSelectPatient
}: {
  analysis: Analysis | null;
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
}) {
  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={Stethoscope} title="人群分层队列" action="医生/运营共同工作台" />
        <div className="patient-table">
          <div className="table-head">
            <span>用户</span>
            <span>分层</span>
            <span>最近体征</span>
            <span>照护人</span>
          </div>
          {patients.map((patient) => (
            <button
              className={patient.id === selectedPatientId ? 'table-row selectable selected' : 'table-row selectable'}
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              type="button"
            >
              <span>
                <strong>{patient.name}</strong>
                <small>{patient.conditions.join('、')}</small>
              </span>
              <span className={riskClass(patient.riskTier)}>{riskLabels[patient.riskTier]}</span>
              <span>
                {patient.latest.heartRate}bpm · {patient.latest.systolic}/{patient.latest.diastolic}mmHg
              </span>
              <span>{patient.caregiver}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={ClipboardCheck} title="复核队列" action="SLA 2小时" />
        <div className="review-list">
          <OperationItem title="高风险报告复核" detail="王先生：LDL-C、HRV、PRS证据同向" />
          <OperationItem title="OCR字段确认" detail="林女士：体检报告日期与单位需确认" />
          <OperationItem title="干预计划跟进" detail="陈女士：睡眠改善计划第2周" />
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={MessageSquareText} title="医生备注" action={analysis ? '可写回报告' : '未生成分析'} />
        <textarea
          defaultValue="建议补充近3个月血脂报告，若胸闷、心悸或运动耐量下降，应提前到线下门诊评估。"
          rows={8}
        />
      </section>
    </div>
  );
}

function EmergencyPage({
  analysis,
  emergency,
  patient,
  running,
  onSimulate
}: {
  analysis: Analysis | null;
  emergency: EmergencyEvent | null;
  patient: Patient;
  running: boolean;
  onSimulate: () => void;
}) {
  const prompt = emergency?.riskPrompt ?? analysis?.fusion.riskPrompt;
  return (
    <div className="two-column">
      <section className="emergency-panel">
        <span className="risk urgent">急救闭环</span>
        <h2>{prompt?.emergencyFlag ? '已触发急性风险流程' : '未触发急性风险'}</h2>
        <p>{prompt?.summary ?? `${patient.name} 当前无急性事件窗口，仍可运行演练验证通知链路。`}</p>
        <button className="button danger" disabled={running} onClick={onSimulate} type="button">
          {running ? <Loader2 className="spin" size={17} aria-hidden /> : <BellRing size={17} aria-hidden />}
          运行急救演练
        </button>
      </section>

      <section className="panel">
        <PanelHeader icon={RadioTower} title="通知链路" action={emergency?.status ?? 'standby'} />
        <div className="timeline-list">
          <TimelineStep title="端侧强提醒" detail="震动、铃声、屏幕确认按钮" done={Boolean(prompt?.emergencyFlag)} />
          <TimelineStep title="30秒无响应升级" detail={`通知${patient.caregiver} ${patient.phoneMasked}`} done={Boolean(emergency)} />
          <TimelineStep title="证据摘要写入日志" detail="HR、SpO2、PPG窗口与RiskPrompt" done={Boolean(emergency)} />
          <TimelineStep title="医生台复核" detail="运营台生成急性事件工单" done={false} />
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader icon={AlertTriangle} title="急性证据窗口" action={emergency?.id ?? '未生成事件'} />
        <div className="emergency-grid">
          <MetricCard icon={HeartPulse} label="模拟心率" value={148} suffix="bpm" tone="danger" />
          <MetricCard icon={Activity} label="模拟HRV" value={9} suffix="ms" tone="danger" />
          <MetricCard icon={ShieldCheck} label="模拟血氧" value={88} suffix="%" tone="danger" />
        </div>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="page-grid">
      <section className="panel">
        <PanelHeader icon={LockKeyhole} title="授权与隐私" action="最小必要" />
        <div className="toggle-list">
          <ToggleItem checked title="采集前明示同意" detail="每类模态均记录授权版本" />
          <ToggleItem checked title="面部特征端侧脱敏" detail="云端仅保存特征向量与质量指标" />
          <ToggleItem checked={false} title="开放科研数据集" detail="默认关闭，需单独伦理审批" />
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={DatabaseZap} title="平台接口" action="可扩展" />
        <div className="operation-list">
          <OperationItem title="设备网关" detail="BLE手环、掌腹PPG、家庭血压计" />
          <OperationItem title="报告解析" detail="OCR、结构化字段校验、医生复核" />
          <OperationItem title="医学知识库" detail="指南摘要、RAG检索、证据引用" />
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader icon={Workflow} title="上线检查清单" action="MVP到生产" />
        <div className="checklist-grid">
          <ToggleItem checked title="用户端Web/PWA" detail="当前工程已实现可运行界面" />
          <ToggleItem checked title="API多智能体管线" detail="已包含质量控制、专家智能体、融合仲裁" />
          <ToggleItem checked title="CI与Docker" detail="本地与GitHub Actions脚本已准备" />
          <ToggleItem checked={false} title="真实医疗器械接入" detail="生产前需设备SDK与临床验证" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone = 'default'
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  suffix: string;
  tone?: 'default' | 'warn' | 'danger';
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <Icon size={20} aria-hidden />
      <span>{label}</span>
      <strong>
        {value}
        <small>{suffix}</small>
      </strong>
    </article>
  );
}

function PanelHeader({ icon: Icon, title, action }: { icon: typeof Activity; title: string; action: string }) {
  return (
    <div className="panel-header">
      <div>
        <Icon size={18} aria-hidden />
        <h3>{title}</h3>
      </div>
      <span>{action}</span>
    </div>
  );
}

function VitalTile({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return (
    <div className="vital-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{unit}</small>
    </div>
  );
}

function RiskGauge({ level, score }: { level: RiskLevel | RiskTier; score: number }) {
  return (
    <div className={`risk-gauge ${level}`} style={{ '--score': `${score * 3.6}deg` } as CSSProperties}>
      <div>
        <span>综合风险</span>
        <strong>{score}</strong>
        <small>{riskLabels[level]}</small>
      </div>
    </div>
  );
}

function TrendChart({ series, compact = false }: { series: TimelinePoint[]; compact?: boolean }) {
  const points = series.length ? series : [];
  const width = 720;
  const height = compact ? 180 : 240;
  const padding = 28;

  function polyline(key: 'heartRate' | 'hrv' | 'risk') {
    if (!points.length) return '';
    const values = points.map((item) => item[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return points
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
        const y = height - padding - ((item[key] - min) / span) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <div className={compact ? 'chart compact' : 'chart'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="7日健康趋势图">
        <line className="axis" x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} />
        <polyline className="line hr" points={polyline('heartRate')} />
        <polyline className="line hrv" points={polyline('hrv')} />
        <polyline className="line risk-line" points={polyline('risk')} />
        {points.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
          return (
            <text className="chart-label" key={item.id} x={x} y={height - 6} textAnchor="middle">
              {item.day}
            </text>
          );
        })}
      </svg>
      <div className="chart-legend">
        <span className="hr">心率</span>
        <span className="hrv">HRV</span>
        <span className="risk-line">风险</span>
      </div>
    </div>
  );
}

function EvidenceGraph({ analysis }: { analysis: Analysis | null }) {
  const nodes = analysis?.fusion.evidenceGraph.nodes ?? [
    { id: 'cad', label: '冠心病风险', score: 0.42 },
    { id: 'acute', label: '急性事件', score: 0.18 },
    { id: 'aging', label: '血管老化', score: 0.32 },
    { id: 'metabolic', label: '代谢压力', score: 0.35 }
  ];
  return (
    <div className="evidence-graph">
      {nodes.map((node) => (
        <div className="graph-node" key={node.id}>
          <span>{node.label}</span>
          <meter min={0} max={1} value={Math.min(1, node.score)} />
          <strong>{node.score.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}

function ActionList({ analysis }: { analysis: Analysis | null }) {
  const actions = analysis?.coach.actionList ?? ['完成一次60秒掌腹PPG复测', '补充最近体检报告', '记录睡眠、运动和心悸症状'];
  return (
    <ol className="action-list">
      {actions.map((action) => (
        <li key={action}>
          <CheckCircle2 size={16} aria-hidden />
          <span>{action}</span>
        </li>
      ))}
    </ol>
  );
}

function UploadItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="upload-item">
      <UploadCloud size={18} aria-hidden />
      <div>
        <strong>{title}</strong>
        <span>{status}</span>
      </div>
    </div>
  );
}

function OperationItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="operation-item">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function TimelineStep({ title, detail, done }: { title: string; detail: string; done: boolean }) {
  return (
    <div className={done ? 'timeline-step done' : 'timeline-step'}>
      <CheckCircle2 size={17} aria-hidden />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function ToggleItem({ checked, title, detail }: { checked: boolean; title: string; detail: string }) {
  return (
    <label className="toggle-item">
      <input checked={checked} readOnly type="checkbox" />
      <span />
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </label>
  );
}

function EmptyAction({ label, action, onClick }: { label: string; action: string; onClick: () => void }) {
  return (
    <div className="empty-action">
      <span>{label}</span>
      <button className="button ghost" onClick={onClick} type="button">
        <BrainCircuit size={17} aria-hidden />
        {action}
      </button>
    </div>
  );
}
