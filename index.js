const express = require('express');
const auth = require('./wechat/auth.js');

const app = express();
app.use(auth());


app.get('/', (req, res) => {
res.send('Hello World!')
})

app.listen(3000, () => console.log(`微信公众号端口服务启动成功^_^`));
