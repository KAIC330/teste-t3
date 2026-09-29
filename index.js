const express = require('express');
const app = express();

app.use(express.json());

app.all('*', (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
  
  // Resposta estruturada no padrão completo LeanCloud / T3
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
