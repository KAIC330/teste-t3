const express = require('express');
const app = express();

app.use(express.json());

app.all('*', (req, res) => {
  console.log('Pedido recebido do jogo:', req.method, req.url);
  res.json({
    code: 0,
    message: "success",
    data: {
      uid: "12345",
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
