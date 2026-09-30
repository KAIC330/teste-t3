const express = require('express');
const app = express();

app.use(express.raw({ type: '*/*', limit: '10mb' }));

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return proto + '://' + req.headers.host;
}

function ok(data) {
  return { errorCode: '0', status: '1', data: data || {} };
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
      sdkPageUrl: base,
      userVersion: '2'
    },
    notice: { switch: '0', content: '' },
    security: { identityAuth: '0', payIdentityAuth: '0' },
    agreement: { switch: '0', version: '1' }
  });
}

app.use((req, res) => {
  const url = req.originalUrl;
  const raw = req.body && req.body.length ? req.body.toString('utf8') : '';

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

  if (url.startsWith('/ucenter2.0/entry/entry')) {
    let svc = '';
    try { svc = JSON.parse(raw).service || ''; } catch (e) {}
    if (svc === 'palm.platform.ucenter.init') {
      console.log('-> init response enviada');
      return res.json(initResponse(req));
    }
    console.log('-> servico sem resposta propria: ' + svc);
    return res.json(ok({}));
  }

  return res.json(ok({}));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Servidor v4 a correr na porta ' + port));
