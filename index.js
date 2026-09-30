const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BASE = process.env.BASE_URL || 'https://teste-t3-production.up.railway.app';

// Registra TODO pedido que chegar (aparece em Deployments > View logs no Railway)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} body=${JSON.stringify(req.body || {})}`);
  next();
});

// ---------- ARAT: configuracao que o jogo baixa ao abrir ----------
app.get('/config/ylt_config.json', (req, res) => {
  res.json({
    OpenHotFix: false,
    HotFixURL: BASE + '/hotfix/',
    VideoURL: '',
    NoticeURL: BASE + '/notice',
    LoginURL: BASE + '/login',
    OpenFileLog: false,
    OpenYiDun: false
  });
});

// ---------- ARAT: rotas simples para o proximo passo ----------
app.get('/notice', (req, res) => {
  res.json({ code: 0, message: 'success', data: [] });
});

// ---------- T3 ARENA: resposta padrao (mantida como estava) ----------
app.all('*', (req, res) => {
  res.json({
    objectId: "934623665449189377",
    uid: "934623665449189377",
    username: "REIDOSGAMETTK",
    nickname: "REIDOSGAMETTK",
    name: "REIDOSGAMETTK",
    level: 100,
    exp: 999999,
    gold: 999999,
    coins: 999999,
    gems: 999999,
    diamond: 999999,
    is_creator: true,
    creator_badge: 1,
    creatorBadge: 1,
    isCreator: true,
    official: true,
    role: "creator",
    authData: {},
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2026-09-29T00:00:00.000Z"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
