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
    //console.log(query);
    // {    query格式如下
    //     signature: '6d35c950ef450598e52f764caceb26c0edb86660',
    //     timestamp: '1682135944',
    //     nonce: '619212066',
    //     openid: 'o_Nhp5hGbDUcNAPOeGO82sSNBV_w'
    //     }
    const { signature, timestamp, nonce, echostr } = query;
    const sha1str = sha1([timestamp, nonce, TOKEN].sort().join(''));//.sort()是字典排序方法，.join('')字符串拼接
    if (method === 'GET') {
      // GET 请求验证服务器有效性 (只有验证token的时候才会有get请求？)
      //console.log(signature);
      //console.log(sha1str);
      if (signature === sha1str) {
        console.log('echostr'+echostr);
        res.send(echostr);//发送echostr给微信服务器
      } else {
        res.end('error1'); 
      }
    } else if (method === 'POST') {
      // 微信服务器发送消息
      if (signature !== sha1str) res.end('error2');
      // req.query中的openid为用户的id
      //console.log('req'+req);
      const xmlData = await getUserDataAsync(req); // 获取xml数据
      //console.log('xmlData'+xmlData);
      //以下是xmlData的格式
//       <xml><ToUserName><![CDATA[gh_d253e7e6c836]]></ToUserName>
// <FromUserName><![CDATA[o_Nhp5hGbDUcNAPOeGO82sSNBV_w]]></FromUserName>
// <CreateTime>1682138532</CreateTime>
// <MsgType><![CDATA[text]]></MsgType>
// <Content><![CDATA[你好]]></Content>
// <MsgId>24082432757757145</MsgId>
// </xml>
      const jsData = await parseXMLAsync(xmlData); // 将xml转化为js对象
      const message = formatMessage(jsData); // 格式化xml对象
      //console.log(message);
      const options = {
        type: 'text',
        to: message.FromUserName,
        from: message.ToUserName
      }
      //console.log(options);
      options.msg = '不支持回复该类型的消息🥹！'
      // 回复文本消息，message.Content为内容
      const MsgType = message.MsgType;
      if (MsgType === 'text') {
        const answer = await getChatAI({ msg: message.Content });
        options.msg = answer;
      } else if (MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if(message.ToUserName==='gh_fe6a39d7cba7'){
                options.msg = `欢迎关注 leon 的公众号 ，作者不定时写个文章。本公众号于2023.04.20接入青云客机器人接口，发送消息有惊喜`;
            }else{
                options.msg = `欢迎关注 Ernest 的公众号 ，作者不定时写个文章。本公众号于2023.04.20接入青云客机器人接口，发送消息有惊喜`;
            }
        }
      }
      /**
       * 可以自定义其他类型的数据，模板已经在template.js中给出
       * 参考官方文档:
       *   https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html#0
       */

      // 如果用户发送其他类型的消息则返回错误
      res.send(template(options));//template将他转换成了微信格式的消息
    } else {
      res.end('error0');
    }
  }
}