import crypto from 'node:crypto';

const wechatSessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function maskOpenId(openid) {
  if (!openid || openid.length <= 8) return openid ? '***' : null;
  return `${openid.slice(0, 4)}***${openid.slice(-4)}`;
}

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of wechatSessions.entries()) {
    if (session.expiresAtMs <= now) wechatSessions.delete(id);
  }
}

export async function createWechatSession(code) {
  pruneExpiredSessions();

  const appId = process.env.WECHAT_MINIPROGRAM_APP_ID;
  const appSecret = process.env.WECHAT_MINIPROGRAM_APP_SECRET;
  if (!appId || !appSecret) {
    return {
      configured: false,
      error: 'wechat_credentials_required',
      message: '需要配置 WECHAT_MINIPROGRAM_APP_ID 和 WECHAT_MINIPROGRAM_APP_SECRET 后才能调用 code2Session。'
    };
  }

  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', appId);
  url.searchParams.set('secret', appSecret);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`wechat_code2session_http_${response.status}`);
  }

  const data = await response.json();
  if (data.errcode) {
    throw new Error(`wechat_code2session_${data.errcode}: ${data.errmsg || 'unknown error'}`);
  }
  if (!data.session_key || !data.openid) {
    throw new Error('wechat_code2session_missing_session_key');
  }

  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const expiresAtMs = Date.now() + SESSION_TTL_MS;
  wechatSessions.set(id, {
    id,
    appId,
    sessionKey: data.session_key,
    openid: data.openid,
    unionid: data.unionid,
    createdAt,
    expiresAtMs
  });

  return {
    configured: true,
    session: {
      id,
      openIdMasked: maskOpenId(data.openid),
      hasUnionId: Boolean(data.unionid),
      createdAt,
      expiresAt: new Date(expiresAtMs).toISOString()
    }
  };
}

function getWechatSession(sessionId) {
  pruneExpiredSessions();
  const session = wechatSessions.get(sessionId);
  if (!session) {
    throw new Error('wechat_session_not_found_or_expired');
  }
  return session;
}

export function decryptWeRunPayload({ sessionId, encryptedData, iv }) {
  const session = getWechatSession(sessionId);
  const sessionKey = Buffer.from(session.sessionKey, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');

  if (sessionKey.length !== 16) throw new Error('invalid_wechat_session_key');
  if (ivBuffer.length !== 16) throw new Error('invalid_wechat_iv');

  const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuffer);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'base64')), decipher.final()]);
  const payload = JSON.parse(decrypted.toString('utf8'));

  const expectedAppId = process.env.WECHAT_MINIPROGRAM_APP_ID;
  if (expectedAppId && payload.watermark?.appid && payload.watermark.appid !== expectedAppId) {
    throw new Error('wechat_watermark_appid_mismatch');
  }

  return {
    payload,
    session: {
      id: session.id,
      openIdMasked: maskOpenId(session.openid),
      createdAt: session.createdAt
    }
  };
}

function normalizeTimestamp(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw > 1_000_000_000_000 ? Math.round(raw / 1000) : Math.round(raw);
}

export function normalizeWeRunSteps(stepInfoList = []) {
  const deduped = new Map();
  for (const item of stepInfoList) {
    const timestamp = normalizeTimestamp(item.timestamp);
    const step = Math.max(0, Math.round(Number(item.step)));
    if (!timestamp || !Number.isFinite(step)) continue;
    deduped.set(timestamp, { timestamp, step });
  }
  return [...deduped.values()].sort((left, right) => left.timestamp - right.timestamp);
}

function average(items) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + item.step, 0) / items.length);
}

function computeTrendPercent(recentItems, previousItems) {
  const recent = average(recentItems);
  const previous = average(previousItems);
  if (!previous) return 0;
  return Math.round(((recent - previous) / previous) * 100);
}

export function createWeRunDeviceEvent(patient, stepInfoList, metadata = {}) {
  const steps = normalizeWeRunSteps(stepInfoList);
  if (!steps.length) {
    throw new Error('wechat_werun_empty_step_info');
  }

  const latest = steps.at(-1);
  const recent7 = steps.slice(-7);
  const previous7 = steps.slice(-14, -7);
  const average7 = average(recent7);
  const average30 = average(steps.slice(-30));
  const trendPercent = computeTrendPercent(recent7, previous7);
  const activeDays7 = recent7.filter((item) => item.step >= 5000).length;
  const lowActivityDays7 = recent7.filter((item) => item.step < 3000).length;
  const latestAt = new Date(latest.timestamp * 1000).toISOString();

  const readings = {
    stepsToday: latest.step,
    steps7dAvg: average7,
    steps30dAvg: average30,
    activeDays7,
    lowActivityDays7,
    stepTrendPercent: trendPercent
  };

  const riskFlags = [];
  if (latest.step < 1500) riskFlags.push('今日微信运动步数低于1500步');
  if (average7 < 3000) riskFlags.push('近7日平均步数低于3000步');
  if (trendPercent <= -35) riskFlags.push('近7日步数较前一周明显下降');
  if (patient.latest.systolic >= 140 && average7 < 5000) riskFlags.push('血压偏高且活动量不足');

  return {
    id: `werun-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    deviceType: 'wechat_werun',
    createdAt: nowIso(),
    readings,
    quality: {
      completeness: Math.min(1, Math.round((steps.length / 30) * 100) / 100),
      signalToNoise: 0.99,
      motionArtifact: 0
    },
    riskFlags,
    tasks: riskFlags.length
      ? ['生成3日轻量步行任务', '结合血压和心率观察运动耐受', '提醒家属关注活动量骤降']
      : ['维持当前步行目标', '写入长期活动趋势', '下周复核运动-血压联动'],
    source: {
      provider: 'wechat_werun',
      authorization: 'scope.werun',
      recordCount: steps.length,
      latestAt,
      openIdMasked: metadata.openIdMasked ?? null,
      ingestionMode: metadata.ingestionMode ?? 'server_decrypted'
    },
    stepInfoList: steps.slice(-30)
  };
}

export function demoWeRunStepInfo(patient) {
  const base = Math.max(1200, Number(patient.latest.steps || 4200));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const wave = Math.round(Math.sin(index / 4) * 620);
    const recovery = index > 22 ? Math.round((index - 22) * 95) : 0;
    return {
      timestamp: Math.round(date.getTime() / 1000),
      step: Math.max(600, base - 760 + wave + recovery)
    };
  });
}
