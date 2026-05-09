export function runCoachAgent(fusion) {
  const { riskPrompt } = fusion;
  const baseTasks = [
    '完成一次60秒掌腹PPG复测',
    '记录今日睡眠、运动和胸闷/心悸症状',
    '将最近体检报告补充到报告解析模块'
  ];

  const urgentTasks = [
    '立即进行端侧强提醒并请求用户确认',
    '若30秒内无响应，通知预设家属/照护者',
    '将异常窗口、定位和证据摘要写入审计日志'
  ];

  return {
    agent: 'user_interaction_agent',
    status: 'completed',
    actionList: riskPrompt.emergencyFlag ? urgentTasks : baseTasks,
    tone: riskPrompt.emergencyFlag ? 'emergency' : 'coach',
    message: riskPrompt.emergencyFlag
      ? '检测到需要立即确认的急性风险信号，请启动预警闭环。'
      : '本周重点是复测PPG、改善睡眠恢复并补齐报告证据。'
  };
}
