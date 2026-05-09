# Vitalife 微信小程序

这是 Vitalife 的原生微信小程序端，用于呈现老人/家属侧的核心流程：健康总览、多模态采集、智能体分析、周期报告和急救联动。

## 导入方式

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择 `apps/miniprogram`。
4. AppID 暂时可使用测试号或将 `project.config.json` 里的 `appid` 替换为正式小程序 AppID。
5. 本地联调时，在微信开发者工具中勾选“不校验合法域名、web-view、TLS 版本以及 HTTPS 证书”。

## API 地址

默认接口地址在 `app.js`：

```js
apiBaseUrl: 'http://127.0.0.1:8787'
```

本地联调前先在仓库根目录启动 API：

```bash
npm run dev
```

生产发布时需要：

- 将 `apiBaseUrl` 替换为 HTTPS 域名。
- 在微信公众平台配置 `request` 合法域名。
- 接入微信登录、手机号授权、订阅消息和隐私协议。

## 页面

- `pages/dashboard`：健康总览、患者切换、风险分、体征与闭环任务。
- `pages/capture`：面部 ROI、掌腹 PPG、报告 OCR、基因 PRS 与隐私提示。
- `pages/agents`：任务编排、质量控制、证据图谱、RiskPrompt。
- `pages/report`：周期健康报告、趋势摘要、医生复核。
- `pages/emergency`：急救演练、通知链路、事件摘要。

## 数据策略

小程序会优先请求 `apps/api` 服务；如果本地 API 不可用，会自动落到内置模拟数据，便于快速查看界面和交互。
