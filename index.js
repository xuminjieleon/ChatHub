const express = require('express');
const auth = require('./wechat/auth.js');

const app = express();
app.use(auth());

//当用户以get方式请求"/"时，它后面的回调函数会执行
app.get('/', (req, res) => {
res.send('Hello World!')
})

app.listen(3000, () => console.log(`微信公众号端口服务启动成功^_^`));
