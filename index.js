const express = require('express');
const app = express();

// Middleware de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middlewares para ler os payloads da requisição
app.use(express.raw({ type: '*/*', limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return proto + '://' + req.headers.host;
}

function ok(data) {
  return { errorCode: '0', errorDesc: '', status: '1', data: data || {} };
}

function initResponse(req) {
  const base = baseUrl(req);
  return ok({
    sessionId: 'sess-' + Date.now(),
    initInfo: {
      ucenterEntryUrl: base + '/ucenter2.0/entry/entry',
      ucenterCoreUrl: base + '/ucenter2.0/entry/entry',
      ucenterHeartbeatUrl: base + '/ucenter2.0/heartbeat/heartbeat',
      bcenterUrl: base + '/billingcenter2.0',
      statisUrl: base + '/logreceiver/receiver',
      heartBeatInterval: '60',
      sdkLogSwitch: '0',
      protocolSwitch: '0',
      advertismentSwitch: '0',
      pushServerUrl: '',
      identityAuthUrl: '',
      gscFrontUrl: base + '/gscfront/sdk/index.do',
      sdkPageUrl: base + '/gscfront/sdk/index.do',
      userVersion: '2'
    },
    notice: { switch: '0', content: '' },
    security: { identityAuth: '0', payIdentityAuth: '0' },
    agreement: { switch: '0', version: '1' },
    cdn: { sourceDomain: '', domainList: base + ',' + base }
  });
}

// Rota para a interface Webview do SDK
app.get('/gscfront/sdk/index.do', (req, res) => {
  res.send('<html><head><meta charset="utf-8"><title>Login</title></head><body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><h2>Carregando...</h2></body></html>');
});

// Resposta para verificações de versão e patcher (VersionList)
app.all(['*version*', '*VersionList*', '*versionlist*'], (req, res) => {
  res.json({
    code: 0,
    msg: 'success',
    data: {
      version: '1.0.795',
      resVersion: '1.0.795',
      forceUpdate: false,
      cdnUrl: baseUrl(req)
    }
  });
});

// Middleware genérico para captura de rotas e rotas da SDK
app.use((req, res) => {
  const url = req.originalUrl;
  let raw = '';
  if (Buffer.isBuffer(req.body)) {
    raw = req.body.toString('utf8');
  } else if (typeof req.body === 'object') {
    raw = JSON.stringify(req.body);
  }

  if (url.startsWith('/logreceiver')) {
    return res.json({ code: 0, msg: 'ok', data: {} });
  }

  // Tenta extrair o serviço de qualquer payload (JSON ou form-urlencoded)
  let svc = '';
  if (req.body) {
    if (req.body.service) svc = req.body.service;
    else if (req.body.jsonStr) {
      try {
        const parsedJson = JSON.parse(req.body.jsonStr);
        if (parsedJson.service) svc = parsedJson.service;
      } catch (e) {}
    }
  }
  if (!svc && raw) {
    try {
      const parsedRaw = JSON.parse(raw);
      if (parsedRaw.service) svc = parsedRaw.service;
    } catch (e) {}
  }

  console.log(JSON.stringify({
    t: new Date().toISOString(),
    method: req.method,
    path: url,
    service: svc,
    body: raw.slice(0, 1000)
  }));

  if (url.includes('/billingcenter2.0')) {
    return res.json(ok({ balance: 99999, items: [] }));
  }

  if (url.startsWith('/ucenter2.0') || svc) {
    if (svc === 'palm.platform.ucenter.init' || url.includes('init')) {
      return res.json(initResponse(req));
    }
    if (svc === 'palm.platform.ucenter.createRandomDeviceId') {
      return res.json(ok({ randomDeviceId: 'dev' + Math.random().toString(16).slice(2, 14) }));
    }
    if (svc === 'palm.platform.ucenter.sdkUpgrade' || url.includes('sdkUpgrade')) {
      return res.json(ok({ 
        code: '0', 
        url: 'https://teste-t3-production.up.railway.app/update', 
        fileSize: '0', 
        description: 'Latest version', 
        version: '1.0.0', 
        isUpdate: '0' 
      }));
    }
    if (svc === 'palm.platform.ucenter.heartbeat_v2' || url.includes('heartbeat')) {
      return res.json(ok({ messages: [] }));
    }
    if (svc.includes('login') || url.includes('login')) {
      return res.json(ok({ sessionId: 'sess-' + Date.now(), uid: '10001', token: 'mock-token-success' }));
    }
    return res.json(ok({}));
  }

  return res.json(ok({}));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Servidor v11 a correr na porta ' + port));
