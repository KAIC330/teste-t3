const express = require('express');
const app = express();

app.use(express.raw({ type: '*/*', limit: '10mb' }));

app.all('*', (req, res) => {
  const body = req.body && req.body.length
    ? req.body.toString('utf8').slice(0, 1500)
    : '';
  console.log(JSON.stringify({
    t: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    type: req.headers['content-type'] || '',
    len: req.body ? req.body.length : 0,
    body
  }));
  res.json({ code: 0, msg: 'ok', data: {} });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Servidor a correr na porta ' + port));
