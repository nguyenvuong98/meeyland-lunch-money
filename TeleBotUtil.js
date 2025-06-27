const { Telegraf } = require("telegraf");
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl ='socks5h://meeyproxy:CjFbmZHlPu1sVFeQ4z9F@152.42.251.165:1080';
const agent = new SocksProxyAgent(proxyUrl);
const groupId = '-4740117964'

class TeleBotUtil {
  constructor() {
    this.bot = new Telegraf("5736888968:AAHmIox0-M0tVX0bPgv-nCVFrWw3BMGYQxo", {
      telegram: {
        agent: agent
      }
    });
    this.bot.launch();
  }

  sendLogMessage(msg) {
    this.bot.telegram.sendMessage(groupId, msg, { disable_web_page_preview: true });
  }

  sendImgUrl(url, caption) {
    if (!url) { return; }

    this.bot.telegram.sendPhoto(groupId, url, {
      caption: caption,
      parse_mode: 'HTML'
    });
  }
}

module.exports = new TeleBotUtil();
