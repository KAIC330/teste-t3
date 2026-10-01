const express = require('express');
const app = express();

const BASE = 'https://teste-t3-production.up.railway.app';

// Captura o corpo cru de toda requisicao, mesmo quando o Content-Type
// nao bate com o conteudo real (o jogo manda JSON com Content-Type de form).
function captureRaw(req, res, buf) {
  req.rawBody = buf.toString('utf8');
}
app.use(express.json({ verify: captureRaw }));
app.use(express.urlencoded({ extended: true, verify: captureRaw }));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} raw=${req.rawBody || ''}`);
  next();
});

// Tenta descobrir o JSON de verdade do pedido, mesmo quando o body-parser
// interpretou errado (comum quando o Content-Type diz "form" mas o conteudo e JSON puro).
function getJsonBody(req) {
  if (req.body && typeof req.body === 'object' && req.body.service) {
    return req.body;
  }
  if (req.rawBody) {
    try {
      return JSON.parse(req.rawBody);
    } catch (e) {
      // o corpo pode ter virado uma "chave" unica do form parser
      const keys = Object.keys(req.body || {});
      if (keys.length === 1 && keys[0].startsWith('{')) {
        try { return JSON.parse(keys[0]); } catch (e2) {}
      }
    }
  }
  return {};
}

// ---------- ucenter2.0: login + checkUpdate (sdkUpgrade) no mesmo endereco ----------
app.post('/ucenter2.0/entry/entry', (req, res) => {
  const body = getJsonBody(req);
  const service = body.service;
  console.log('  service=', service);

  if (service === 'palm.platform.ucenter.sdkUpgrade') {
    return res.json({
      status: '1',
      data: {
        code: '0',        // 0 = sem atualizacao, 1 = opcional, 2 = obrigatoria
        url: '',
        fileSize: '0',
        description: '',
        version: ''
      }
    });
  }

  if (service === 'palm.platform.ucenter.init') {
    // Campos que o SDK pode ler tanto soltos em "data" quanto dentro de
    // "data.initInfo" -- colocamos nos dois lugares para nao depender de
    // adivinhar certo qual dos dois caminhos o codigo realmente usa.
    const serviceUrls = {
      ucenterEntryUrl: BASE + '/ucenter2.0/entry/entry',
      ucenterCoreUrl: BASE + '/ucenter2.0',
      ucenterHeartbeatUrl: BASE + '/ucenter2.0/heartbeat/heartbeat',
      bcenterUrl: BASE + '/billingcenter2.0',
      pushServerUrl: BASE + '/ucenter2.0/push2.0/sdkpush',
      identityAuthUrl: BASE + '/login/identity_authentication',
      sdkPageUrl: BASE
    };

    return res.json({
      status: '1',
      data: Object.assign({
        ip: '0.0.0.0',
        isLimit: '0',
        limitDesc: '',
        sessionId: 'sess_' + Date.now(),
        longtuId: 'lt_' + Date.now(),
        heartBeatInterval: '60',
        cdn: [],
        agreement: { switch: '0', version: '1' },
        ipInfo: { locationCountry: '', locationProvince: '' },
        notice: { switch: '0', content: '' },
        activateCode: { switch: '0', openActivateWin: '0' },
        security: {},
        gameInfo: {},
        initInfo: Object.assign({
          sdkLogSwitch: '0',
          protocolSwitch: '0',
          advertismentSwitch: '0',
          sandBoxSwitch: '0',
          forceTouristBindSwitch: '0',
          userVersion: '1',
          customerServiceSwitch: '0',
          scanCodeSwitch: '0'
        }, serviceUrls)
      }, serviceUrls)
    });
  }

  res.json({ status: '1', data: {} });
});

// ---------- rotas simples (placeholder) ----------
app.get('/notice', (req, res) => {
  res.json({ code: 0, message: 'success', data: [] });
});

app.all('*', (req, res) => {
  res.json({ status: '1', data: {} });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor v6 a correr na porta ${PORT}`);
});
