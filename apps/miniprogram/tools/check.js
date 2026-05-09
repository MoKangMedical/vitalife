const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const jsonFiles = ['app.json', 'project.config.json', 'sitemap.json'];
const requiredRootFiles = ['app.js', 'app.json', 'app.wxss', 'project.config.json', 'sitemap.json'];

function readJson(file) {
  return JSON.parse(readFileSync(join(root, file), 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const file of requiredRootFiles) {
  assert(existsSync(join(root, file)), `Missing required file: ${file}`);
}

for (const file of jsonFiles) {
  readJson(file);
}

const appJson = readJson('app.json');
assert(Array.isArray(appJson.pages), 'app.json pages must be an array');
assert(appJson.pages.length >= 5, 'miniprogram should include the five core pages');

for (const page of appJson.pages) {
  for (const ext of ['js', 'json', 'wxml', 'wxss']) {
    const file = `${page}.${ext}`;
    assert(existsSync(join(root, file)), `Missing page file: ${file}`);
  }
}

const jsFiles = [
  'app.js',
  'utils/api.js',
  'utils/format.js',
  'utils/mock.js',
  ...appJson.pages.map((page) => `${page}.js`)
];

for (const file of jsFiles) {
  const source = readFileSync(join(root, file), 'utf8');
  new Function(source);
}

console.log(`Vitalife miniprogram check passed: ${appJson.pages.length} pages`);
