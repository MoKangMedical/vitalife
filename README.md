# Vitalife

Vitalife 是一个“多模态心血管与抗衰健康管理 Agent”平台原型。工程把面部视觉表型、掌腹 PPG/ECG、体检报告 OCR、基因 PRS、用户症状和照护信息组织成可解释证据，再由多智能体管线完成质量控制、专家分析、证据图谱、融合仲裁、健康干预和急性风险闭环。

## 已实现平台

- 用户健康总览：风险分、血管年龄偏离、实时体征、7 日趋势、闭环任务。
- Vitalife Agent OS：MIMO底座、Vitalife MemOS、证据研究链、Agent + Skill 编排、Skill市场和企业Agent模板。
- 多模态采集台：面部 ROI、PPG 复测、报告/基因上传状态、端侧隐私控制。
- 智能体分析中心：任务编排流程、质量控制向量、专家证据表、RiskPrompt 输出。
- 报告中心：周期健康报告、医生复核、家属同步、归档流程。
- 医生/运营台：人群分层队列、复核队列、医生备注。
- 急救联动台：急性事件演练、端侧提醒、家属通知、审计日志流程。
- 系统设置：授权、隐私、接口、上线检查清单。
- 微信小程序端：老人/家属侧移动入口，覆盖总览、采集、智能体、报告、急救五个 Tab。

## 工程结构

- `apps/web`：React + Vite 前端平台。
- `apps/api`：Express API 与可替换的多智能体分析管线。
- `apps/miniprogram`：原生微信小程序端，可导入微信开发者工具。
- `.github/workflows/ci.yml`：GitHub Actions 类型检查、构建和冒烟测试。
- `docker-compose.yml`：API + Web 容器化演示。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`。API 默认运行在 `http://localhost:8787`。

## 常用命令

```bash
npm run check
npm run build
npm test
```

微信小程序：

```bash
npm run check:miniprogram
```

然后用微信开发者工具导入 `apps/miniprogram`。本地联调 API 时，先运行 `npm run dev`，并在微信开发者工具中打开“不校验合法域名、web-view、TLS 版本以及 HTTPS 证书”。生产发布时需要替换为 HTTPS API 域名并配置微信合法域名。

## API

- `GET /health`
- `GET /api/platform/overview`
- `GET /api/platform/capabilities`
- `GET /api/patients`
- `GET /api/patients/:id`
- `GET /api/patients/:id/timeline`
- `POST /api/analysis/run`
- `POST /api/emergency/simulate`

## 架构

```mermaid
flowchart LR
  A["用户端/设备采集"] --> B["质量控制与预处理"]
  B --> C["任务编排智能体"]
  C --> D["面部视觉专家"]
  C --> E["PPG/ECG信号专家"]
  C --> F["报告解读专家"]
  C --> G["遗传风险专家"]
  D --> H["证据图谱"]
  E --> H
  F --> H
  G --> H
  H --> I["融合仲裁智能体"]
  I --> J["健康教练/急救闭环"]
  J --> K["用户端/家属端/医生运营台"]
```

## Vitalife 模式

竞品启发不会直接复制为同名功能，仓库里已转成 Vitalife 自有产品体系：

- 底座层：`MIMO Health Foundation`，包含 MIMO API、多模态证据图谱、Vitalife MemOS、Vitalife Research。
- C端：`Vitalife Companion`，包含微信小程序、家庭健康管理、体检报告解读卡和急救联动。
- B端：`Vitalife Agent OS`，通过 Agent + Skill 组装交付医院、保险、药房、体检中心、硬件厂商和科研制药场景。
- 差异化：罕见病筛查、AI药物发现、66个Skill扩展能力和 MIMO API 成本优势。

## 医疗安全说明

当前仓库是工程原型，不构成医学诊断，不能替代临床评估、急救服务或经监管批准的医疗器械软件。进入生产前需要完成数据合规、风险管理、临床验证、模型验证和监管审查。
