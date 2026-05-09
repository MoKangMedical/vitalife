const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const navigationEvents = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearModule(relativePath) {
  const resolved = require.resolve(join(root, relativePath));
  delete require.cache[resolved];
}

function setupRuntime() {
  const storage = {};
  let appConfig = null;

  global.wx = {
    request(options) {
      options.fail && options.fail({ errMsg: 'mock network unavailable' });
    },
    setStorageSync(key, value) {
      storage[key] = value;
    },
    showLoading() {},
    hideLoading() {},
    showToast() {},
    switchTab(options) {
      navigationEvents.push({ type: 'switchTab', url: options.url });
    },
    navigateTo(options) {
      navigationEvents.push({ type: 'navigateTo', url: options.url });
    }
  };

  global.App = (config) => {
    appConfig = config;
  };
  global.getApp = () => appConfig;

  clearModule('app.js');
  require(join(root, 'app.js'));
  assert(appConfig && appConfig.globalData, 'App globalData was not initialized');
  appConfig.onLaunch && appConfig.onLaunch();

  return appConfig;
}

function loadPage(pagePath) {
  let definition = null;
  global.Page = (config) => {
    definition = config;
  };

  clearModule(`${pagePath}.js`);
  require(join(root, `${pagePath}.js`));
  assert(definition, `Page was not registered: ${pagePath}`);

  const page = {
    ...definition,
    data: JSON.parse(JSON.stringify(definition.data || {})),
    setData(patch) {
      this.data = {
        ...this.data,
        ...patch
      };
    }
  };

  return page;
}

async function runDashboardSmoke() {
  const page = loadPage('pages/dashboard/dashboard');
  await page.loadData.call(page);
  assert(page.data.patient && page.data.patient.id, 'dashboard should load a patient');
  assert(page.data.metrics.length >= 4, 'dashboard should show platform metrics');
  assert(page.data.trendRows.length === 7, 'dashboard should load weekly trend rows');
  await page.handleRunAnalysis.call(page);
  assert(getApp().globalData.lastAnalysis, 'dashboard analysis should be stored globally');
}

async function runCaptureSmoke() {
  const page = loadPage('pages/capture/capture');
  await page.loadPatient.call(page);
  assert(page.data.uploads.length === 3, 'capture should prepare report/genomic upload rows');
  page.startCapture.call(page);
  await wait(3200);
  assert(page.data.progress === 100, 'capture progress should complete');
  page.onUnload && page.onUnload.call(page);
}

async function runAgentsSmoke() {
  const page = loadPage('pages/agents/agents');
  await page.loadData.call(page);
  assert(page.data.taskGraph.length >= 7, 'agents should show orchestration task graph');
  assert(page.data.qualityRows.length >= 4, 'agents should show quality vectors');
  assert(page.data.evidenceRows.length >= 1, 'agents should show evidence rows');
  page.goOS.call(page);
  assert(navigationEvents.some((event) => event.url === '/pages/os/os'), 'agents should navigate to Agent OS page');
}

async function runOSSmoke() {
  const page = loadPage('pages/os/os');
  await page.loadData.call(page);
  assert(page.data.layers.length === 3, 'Agent OS should show three Vitalife layers');
  assert(page.data.skills.length >= 9, 'Agent OS should show reusable skills');
  assert(page.data.templates.length >= 5, 'Agent OS should show enterprise templates');
}

async function runReportSmoke() {
  const page = loadPage('pages/report/report');
  await page.loadData.call(page);
  assert(page.data.patient && page.data.patient.name, 'report should load current patient');
  assert(page.data.actions.length >= 1, 'report should show intervention actions');
  assert(page.data.trendRows.length === 7, 'report should load trend rows');
}

async function runEmergencySmoke() {
  const page = loadPage('pages/emergency/emergency');
  await page.loadData.call(page);
  assert(page.data.chain.length === 4, 'emergency should show notification chain');
  await page.simulate.call(page);
  assert(page.data.event && page.data.event.status === 'pending_confirmation', 'emergency simulation should create event');
  assert(page.data.riskLevel === 'urgent', 'emergency simulation should set urgent risk');
}

async function main() {
  setupRuntime();
  assert(appJson.pages.includes('pages/os/os'), 'app.json should include Agent OS page');
  await runDashboardSmoke();
  await runCaptureSmoke();
  await runAgentsSmoke();
  await runOSSmoke();
  await runReportSmoke();
  await runEmergencySmoke();
  console.log(`Vitalife miniprogram smoke test passed: ${appJson.pages.length} pages`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
