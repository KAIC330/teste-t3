const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // A Railway usa a porta 8080 por padrão

// Esta é a rota que o jogo vai procurar assim que abrir
app.get('/gameconfig.xml', (req, res) => {
    res.header("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="utf-8"?>
<config>
    <server_status>online</server_status>
    <!-- Aqui dentro vai as configurações que estavam no jogo original -->
</config>`);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
