const express = require('express');
const app = express();

// Middleware para processar JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz para testes de conexão
app.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] Requisição recebida na raiz (/)`);
  res.status(200).send('Servidor ativo no Railway!');
});

// =========================================================
// Rota de verificação da lista de versões (VersionList.json)
// =========================================================
app.get('/VersionList.json', (req, res) => {
  console.log(`[${new Date().toISOString()}] Requisição recebida em /VersionList.json`);
  
  res.status(200).json({
    code: 0,
    msg: "success",
    version: "1.0.795",
    list: []
  });
});

// Configuração da porta do servidor (Railway atribui automaticamente via process.env.PORT)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
