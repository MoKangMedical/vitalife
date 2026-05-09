export const capabilityModel = {
  positioning:
    'Vitalife 采用 MIMO API 多模态底座 + C端长期健康陪伴 + B端 Agent OS 开放平台的三层模式，聚焦心血管与抗衰健康管理，并向罕见病筛查和药物发现延伸。',
  layers: [
    {
      id: 'foundation',
      name: '底座层',
      title: 'MIMO Health Foundation',
      summary: '统一接入文本、体检报告、面部视觉、PPG/ECG、家庭设备、基因PRS和症状轨迹，形成可解释的多模态医疗证据底座。',
      modules: ['MIMO API', 'Vitalife MemOS', 'Vitalife Research', '证据图谱', '隐私审计']
    },
    {
      id: 'consumer',
      name: 'C端',
      title: 'Vitalife Companion',
      summary: '面向老人、家属和慢病人群，提供长期健康记忆、报告解读、复测提醒、家庭健康管理和线下体检报告解读卡。',
      modules: ['微信小程序', '体检报告解读卡', '家属端同步', '复测任务', '急救联动']
    },
    {
      id: 'business',
      name: 'B端',
      title: 'Vitalife Agent OS',
      summary: '以 Agent + Skill 的可组装模式开放给医院、保险、药房、体检中心和硬件厂商，支持低代码编排专属健康管理智能体。',
      modules: ['Agent编排', 'Skill市场', '租户配置', '工作流审计', '企业API']
    }
  ],
  foundation: [
    {
      id: 'mimo-api',
      name: 'MIMO API 多模态底座',
      capability: '统一理解文本、影像、报告、体征照片、PPG/ECG、设备数据和基因PRS。',
      status: 'platform-ready'
    },
    {
      id: 'memory',
      name: 'Vitalife MemOS',
      capability: '持续记录个人基线、复测窗口、干预响应、家族史和长期风险变化，形成健康时间感。',
      status: 'prototype'
    },
    {
      id: 'research',
      name: 'Vitalife Research',
      capability: '对复杂健康问题触发工具调用、证据补全、指南检索、风险解释和推理链留痕。',
      status: 'prototype'
    },
    {
      id: 'evidence-graph',
      name: '证据图谱与仲裁',
      capability: '把各专家智能体输出归一化为可解释证据，按质量向量和场景策略进行融合。',
      status: 'implemented'
    }
  ],
  skills: [
    {
      id: 'skill-report-card',
      name: '体检报告解读卡',
      category: 'C端获客',
      description: '把一次AI报告解读物化成线下卡片/兑换码，连接体检中心、药房和小程序。',
      inputs: ['OCR报告', '兑换码', '用户授权'],
      outputs: ['结构化指标', '健康摘要', '复测任务']
    },
    {
      id: 'skill-long-memory',
      name: '长期健康记忆',
      category: '底座',
      description: '沉淀个人基线、关键事件、干预响应和家属沟通历史。',
      inputs: ['历史分析', '体征趋势', '问诊摘要'],
      outputs: ['个体基线', '时间线摘要', '风险漂移']
    },
    {
      id: 'skill-research-chain',
      name: '证据研究链',
      category: '底座',
      description: '面向复杂问题执行检索、证据补全、解释生成和审计留痕。',
      inputs: ['RiskPrompt', '知识库', '指南规则'],
      outputs: ['引用证据', '推理链', '医生复核要点']
    },
    {
      id: 'skill-device-gateway',
      name: '硬件数据网关',
      category: '数据入口',
      description: '接入血压计、血糖仪、手环、PPG/ECG设备和家庭健康终端。',
      inputs: ['BLE设备', '厂商API', '家庭网关'],
      outputs: ['体征流', '质量评分', '异常窗口']
    },
    {
      id: 'skill-insurance',
      name: '保险支付与风控',
      category: '商业闭环',
      description: '为保险客户生成健康管理计划、干预合规记录和理赔前后支持证据。',
      inputs: ['保单规则', '健康档案', '干预记录'],
      outputs: ['服务包建议', '风险分层', '履约证据']
    },
    {
      id: 'skill-hospital',
      name: '院内院外联动',
      category: '医疗协作',
      description: '把小程序复测、报告摘要和急性预警工单同步到医生/运营台。',
      inputs: ['患者授权', '院外体征', '医生备注'],
      outputs: ['复核队列', '随访任务', '转诊建议']
    },
    {
      id: 'skill-pharmacy',
      name: '药房健康管理',
      category: '零售药房',
      description: '支持药房场景的报告解读卡兑换、慢病随访、OTC用药提醒和复购任务。',
      inputs: ['门店订单', '报告卡', '用药史'],
      outputs: ['健康建议', '随访计划', '门店服务工单']
    },
    {
      id: 'skill-rare-disease',
      name: '罕见病筛查',
      category: '差异化',
      description: '结合症状、家族史、基因线索和多模态异常，触发罕见病鉴别诊断提示。',
      inputs: ['症状簇', '家族史', '基因变异'],
      outputs: ['疑似疾病谱', '检查建议', '专家转诊线索']
    },
    {
      id: 'skill-drug-discovery',
      name: 'AI药物发现',
      category: '差异化',
      description: '把真实世界健康管理数据与靶点、适应症和药物重定位线索连接。',
      inputs: ['表型数据', '靶点知识图谱', '药物数据库'],
      outputs: ['适应症线索', '候选靶点', '药物重定位假设']
    }
  ],
  agentTemplates: [
    {
      id: 'template-checkup',
      name: '体检报告增长Agent',
      scenario: '体检中心/药房获客',
      skills: ['体检报告解读卡', '长期健康记忆', '证据研究链', '家属端同步'],
      outcome: '把单次体检解读转化为小程序长期健康管理用户。'
    },
    {
      id: 'template-chronic',
      name: '慢病随访Agent',
      scenario: '医院/药房/家庭医生',
      skills: ['硬件数据网关', '长期健康记忆', '风险评估', '健康宣教'],
      outcome: '形成复测、随访、医生复核和异常升级的闭环。'
    },
    {
      id: 'template-insurance',
      name: '保险健康管理Agent',
      scenario: '商业保险/养老险',
      skills: ['保险支付与风控', '报告解读', '干预履约', '院内院外联动'],
      outcome: '支撑保前分层、保中干预和理赔服务证据链。'
    },
    {
      id: 'template-rare',
      name: '罕见病线索Agent',
      scenario: '专病中心/科研合作',
      skills: ['罕见病筛查', '证据研究链', '基因PRS', '专家转诊'],
      outcome: '将长期健康轨迹中的异常模式转化为诊疗端线索。'
    },
    {
      id: 'template-drug',
      name: '药物发现Agent',
      scenario: '制药/科研',
      skills: ['AI药物发现', '真实世界数据', '靶点图谱', '研究链审计'],
      outcome: '围绕表型、适应症和靶点生成可验证研究假设。'
    }
  ],
  commercialPlays: [
    {
      id: 'hardware',
      name: '硬件数据入口',
      partnerType: '血压计/血糖仪/手环/PPG设备厂商',
      playbook: '设备数据进入 Vitalife 后自动生成个性化报告和复测任务，硬件成为连续数据源。'
    },
    {
      id: 'insurance',
      name: '保险+健康管理',
      partnerType: '商业保险/养老险/企业福利',
      playbook: '围绕心血管和抗衰风险形成保前评估、保中干预、理赔支持和续保服务。'
    },
    {
      id: 'hospital',
      name: '院内院外联动',
      partnerType: '医院/体检中心/专病中心',
      playbook: '把院外复测、小程序报告和急性预警转化为医生复核队列与随访任务。'
    },
    {
      id: 'pharmacy',
      name: '药房健康管理',
      partnerType: '连锁药房/中医馆/社区服务点',
      playbook: '通过报告解读卡和门店健康服务，把线下客流导入长期健康管理。'
    },
    {
      id: 'finance',
      name: '金融服务场景',
      partnerType: '银行/高净值客户服务/企业客户',
      playbook: '以健康报告、家庭健康档案和养老服务包增强客户经营。'
    }
  ],
  differentiators: [
    {
      id: 'rare-disease-depth',
      title: '罕见病诊断纵深',
      summary: '健康管理竞品通常停留在慢病和体检解释，Vitalife 可把异常长期轨迹延伸到罕见病线索。'
    },
    {
      id: 'drug-discovery',
      title: 'AI制药与药物发现',
      summary: '将真实世界多模态表型与靶点、适应症和药物重定位连接，形成科研和制药合作入口。'
    },
    {
      id: 'skill-coverage',
      title: '66个Skill可扩展',
      summary: '按 Agent + Skill 组装，可覆盖诊断、制药、药学、健康管理、保险和运营场景。'
    },
    {
      id: 'mimo-cost',
      title: 'MIMO API成本优势',
      summary: '以内部 MIMO API 作为底座，降低边际推理成本，更适合高频长期陪伴和企业级调用。'
    }
  ]
};
