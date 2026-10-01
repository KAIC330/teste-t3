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
    return res.json({
      status: '1',
      data: {
        sessionId: 'sess_' + Date.now(),
        isLimit: '0',
        heartBeatInterval: '60',
        sandBoxSwitch: '0',
        forceTouristBindSwitch: '0',
        agreement: '0',
        userVersion: '1',
        longtuId: 'lt_' + Date.now(),
        initInfo: {
          ucenterCoreUrl: BASE + '/ucenter2.0',
          ucenterHeartbeatUrl: BASE + '/ucenter2.0/heartbeat/heartbeat',
          bcenterUrl: BASE + '/billingcenter2.0',
          pushServerUrl: BASE + '/ucenter2.0/push2.0/sdkpush',
          identityAuthUrl: BASE + '/login/identity_authentication',
          sdkPageUrl: BASE + '/sdk3.0.v2/global/index.html#',
          '/login/login_first': BASE + '/login/login_first',
          '/login/login_switch': BASE + '/login/login_switch',
          '/login/upgrade_tip': BASE + '/login/upgrade_tip',
          '/login/login_bindphone': BASE + '/login/login_bindphone',
          '/login/login_prompt': BASE + '/login/login_prompt',
          '/pcenter/index': BASE + '/pcenter/index',
          '/ucenter/menu': BASE + '/ucenter/menu',
          '/question/question_index': BASE + '/question/question_index',
          '/login/identity_authentication': BASE + '/login/identity_authentication',
          '/pcenter/upgrade': BASE + '/pcenter/upgrade',
          '/login/prompt_cdkey': BASE + '/login/prompt_cdkey',
          '/ucenter/experience_over': BASE + '/ucenter/experience_over',
          '/ucenter/privacy': BASE + '/ucenter/privacy',
          '/ucenter/personal_infolist': BASE + '/ucenter/personal_infolist',
          '/ucenter/third_infolist': BASE + '/ucenter/third_infolist'
        },
        ip: '0.0.0.0',
        ipInfo: '0.0.0.0',
        locationCountry: '',
        locationProvince: '',
        customerServiceSwitch: '0',
        scanCodeSwitch: '0',
        switch: '0',
        content: ''
      }
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
  console.log(`Servidor v5 a correr na porta ${PORT}`);
});
