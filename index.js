const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registra TODO pedido que chegar (aparece em Deployments > View logs no Railway)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} body=${JSON.stringify(req.body || {})}`);
  next();
});

// ---------- ucenter2.0: login + checkUpdate (sdkUpgrade) no mesmo endereco ----------
app.post('/ucenter2.0/entry/entry', (req, res) => {
  const body = req.body || {};
  const service = body.service;

  if (service === 'palm.platform.ucenter.sdkUpgrade') {
    // Responde "nao tem atualizacao disponivel"
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
    // TODO: ainda vamos descobrir o formato exato de login esperado aqui
    return res.json({
      status: '1',
      data: {}
    });
  }

  // qualquer outro "service" nao mapeado ainda: responde algo neutro
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
  console.log(`Servidor v4 a correr na porta ${PORT}`);
});
