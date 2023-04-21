const express = require('express');
const auth = require('./wechat/auth.js');
const { PORT } = require('./config.js');

const app = express();
app.use(auth());


app.get('/', (req, res) => {
res.send('Hello World!')
})

app.listen(80, () => console.log(`微信公众号的 ${PORT} 端口服务启动成功^_^`));