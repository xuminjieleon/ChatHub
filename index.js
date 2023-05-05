const express = require("express"); //引入express 模块
const app = express(); //创建实例
const mysql = require("mysql"); //引入mysql 模块
// 创建数据库连接 填入数据库信息
const conn = mysql.createConnection({
  user: "chathub", //用户名
  password: "1234", //密码
  host: "43.143.111.217", //主机（默认都是local host）
  database: "chathub", //数据库名
});
module.exports=conn;

const auth = require("./wechat/auth.js");
app.use(auth());

//当用户以get方式请求"/"时，它后面的回调函数会执行
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => console.log(`微信公众号端口服务启动成功^_^`));