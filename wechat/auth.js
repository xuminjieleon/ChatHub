const sha1 = require('sha1');
const { TOKEN } = require('../config.js');
const { getUserDataAsync, parseXMLAsync, formatMessage } = require('./utils.js');
const template = require('./template.js');
const getChatAI = require('./request.js');

module.exports = () => {
  return async (req, res) => {
    /**
   * 验证签名步骤:
   * 1.先将 timestamp, nonce, TOKEN 按字典排序并组合成一个字符串
   * 2.然后对得到的字符串进行 sha1 加密
   * 3.最后将加密得到的字符串与 signature 进行对比，如果相同则验证通过
   */
   
    const { query, method } = req;
    console.log(query);
    const { signature, timestamp, nonce, echostr } = query;
    const sha1str = sha1([timestamp, nonce, TOKEN].sort().join(''));
    if (method === 'GET') {
      // GET 请求验证服务器有效性
      //console.log(signature);
      //console.log(sha1str);
      if (signature === sha1str) {
        res.send(echostr);
      } else {
        res.end('error1'); 
      }
    } else if (method === 'POST') {
      // 微信服务器发送消息
      if (signature !== sha1str) res.end('error2');
      // req.query中的openid为用户的id
      const xmlData = await getUserDataAsync(req); // 获取xml数据
      const jsData = await parseXMLAsync(xmlData); // 将xml转化为js对象
      const message = formatMessage(jsData); // 格式化xml对象
      const options = {
        type: 'text',
        to: message.FromUserName,
        from: message.ToUserName
      }
      options.msg = '不支持回复该类型的消息🥹！'
      // 回复文本消息，message.Content为内容
      const MsgType = message.MsgType;
      if (MsgType === 'text') {
        const answer = await getChatAI({ msg: message.Content });
        options.msg = answer;
      } else if (MsgType === 'event') {
        if (message.Event === 'subscribe') {
          options.msg = `欢迎关注 Ernest 的公众号 ，作者不定时写个文章。本公众号于2023.04.20接入青云客机器人接口，发送消息有惊喜`;
        }
      }
      /**
       * 可以自定义其他类型的数据，模板已经在template.js中给出
       * 参考官方文档:
       *   https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html#0
       */

      // 如果用户发送其他类型的消息则返回错误
      res.send(template(options));
    } else {
      res.end('error0');
    }
  }
}