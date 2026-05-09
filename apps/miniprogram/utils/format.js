const riskLabels = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  urgent: '紧急'
};

const agentLabels = {
  facecv_expert_agent: '面部视觉专家',
  signals_expert_agent: 'PPG/ECG信号专家',
  report_expert_agent: '报告解读专家',
  genomic_expert_agent: '遗传风险专家'
};

const modalityLabels = {
  face: '面部视觉',
  signal: 'PPG/ECG信号',
  report: '体检报告',
  genomic: '遗传PRS'
};

function riskText(level) {
  return riskLabels[level] || level || '待评估';
}

function agentText(agent) {
  return agentLabels[agent] || agent;
}

function modalityText(modality) {
  return modalityLabels[modality] || modality;
}

function percent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function shortDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

module.exports = {
  agentText,
  modalityText,
  percent,
  riskText,
  shortDateTime
};
