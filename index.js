const express = require('express');
const app = express();

app.use(express.raw({ type: '*/*', limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Handler para páginas Web / WebView do SDK (evita tela preta)
app.get('/gscfront/sdk/index.do', (req, res) => {
  res.send('<html><head><meta charset="utf-8"><title>Login</title></head><body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><h2>Carregando...</h2><script>setTimeout(function(){ if(window.PalmSDK) { PalmSDK.loginSuccess("mock-token"); } }, 1000);</script></body></html>');
});

app.use((req, res) => {
  const url = req.originalUrl;
  const raw = req.body && Buffer.isBuffer(req.body) ? req.body.toString('utf8') : (typeof req.body === 'object' ? JSON.stringify(req.body) : '');

  if (url.startsWith('/logreceiver')) {
    return res.json({ code: 0, msg: 'ok', data: {} });
  }

  console.log(JSON.stringify({
    t: new Date().toISOString(),
    method: req.method,
    path: url,
    type: req.headers['content-type'] || '',
    len: raw.length,
    body: raw.slice(0, 2000)
  }));

  if (url.startsWith('/ucenter2.0/entry/entry') || url.startsWith('/ucenter2.0/heartbeat')) {
    let svc = '';
    try { 
      const parsed = typeof req.body === 'object' ? req.body : JSON.parse(raw);
      svc = parsed.service || ''; 
    } catch (e) {}
    
    console.log('-> service: ' + svc);

    if (svc === 'palm.platform.ucenter.init') {
      return res.json(initResponse(req));
    }
    if (svc === 'palm.platform.ucenter.createRandomDeviceId') {
      return res.json(ok({ randomDeviceId: 'dev' + Math.random().toString(16).slice(2, 14) }));
    }
    if (svc === 'palm.platform.ucenter.sdkUpgrade') {
      return res.json(ok({ 
        code: '0', 
        url: 'https://teste-t3-production.up.railway.app/update', 
        fileSize: '0', 
        description: 'Latest version', 
        version: '1.0.0', 
        isUpdate: '0' 
      }));
    }
    if (svc === 'palm.platform.ucenter.heartbeat_v2') {
      return res.json(ok({ messages: [] }));
    }
    if (svc === 'palm.platform.ucenter.login' || svc.includes('login')) {
      return res.json(ok({ sessionId: 'sess-' + Date.now(), uid: '10001', token: 'mock-token-success' }));
    }
    return res.json(ok({}));
  }

  return res.json(ok({}));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Servidor v9 a correr na porta ' + port));
