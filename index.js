const express = require('express');
const app = express();

app.use(express.json());

// Intercepta e responde a todos os pedidos com os dados formatados do jogador
app.all('*', (req, res) => {
  console.log('Pedido recebido do jogo:', req.method, req.url);

  // Formato compatível com rotas de perfil do jogo
  res.json({
    code: 0,
    message: "success",
    objectId: "934623665449189377",
    uid: "934623665449189377",
    username: "REIDOSGAMETTK",
    nickname: "REIDOSGAMETTK",
    level: 100,
    coins: 999999,
    gems: 999999,
    is_creator: true,
    creator_badge: 1,
    official: true,
    data: {
      uid: "934623665449189377",
      token: "fake_token_bypass",
      nickname: "REIDOSGAMETTK",
      level: 100,
      coins: 999999,
      gems: 999999,
      is_creator: true,
      creator_badge: 1,
      official: true
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
