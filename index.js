const express = require('express');
const app = express();

app.use(express.raw({ type: '*/*', limit: '10mb' }));

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
      sdkPageUrl: base,
      userVersion: '2'
    },
    notice: { switch: '0', content: '' },
    security: { identityAuth: '0', payIdentityAuth: '0' },
    agreement: { switch: '0', version: '1' },
    cdn: { sourceDomain: req.headers.host, domainList: base + ',' + base }
  });
}

app.use((req, res) => {
  const url = req.originalUrl;
  const raw = req.body && req.body.length ? req.body.toString('utf8') : '';

  if (url.startsWith('/logreceiver')) {
    console.log('LOG ' + raw.slice(0, 1500));
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
    try { svc = JSON.parse(raw).service || ''; } catch (e) {}
    console.log('-> servico: ' + svc);
    if (svc === 'palm.platform.ucenter.init') {
      return res.json(initResponse(req));
    }
    if (svc === 'palm.platform.ucenter.createRandomDeviceId') {
      return res.json(ok({ randomDeviceId: 'dev' + Math.random().toString(16).slice(2, 14) }));
    }
    if (svc === 'palm.platform.ucenter.sdkUpgrade') {
      return res.json(ok({ code: '3', url: '', fileSize: '0', description: '', version: '1.0.0' }));
    }
    if (svc === 'palm.platform.ucenter.heartbeat_v2') {
      return res.json(ok({ messages: [] }));
    }
    return res.json(ok({}));
  }

  return res.json(ok({}));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Servidor v7 a correr na porta ' + port));
