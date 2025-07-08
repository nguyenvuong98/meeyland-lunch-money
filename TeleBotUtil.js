const { Telegraf } = require("telegraf");
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = process.env.TELEGRAM_PROXY;
const agent = new SocksProxyAgent(proxyUrl);
//const groupId = process.env.TELEGRAM_GROUP_ID;
const groupId = process.env.TELEGRAM_GROUP_ID_TEST;

class TeleBotUtil {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
      telegram: {
        agent: agent
      }
    });
    this.bot.launch();
  }

  sendLogMessage(msg) {
    this.bot.telegram.sendMessage(groupId, msg, { disable_web_page_preview: true });
  }

  sendMessageHTML(msg) {
    this.bot.telegram.sendMessage(groupId, msg, { disable_web_page_preview: true, parse_mode: 'HTML' });
  }
  sendImgUrl(url, caption) {
    if (!url) { return; }

    this.bot.telegram.sendPhoto(groupId, url, {
      caption: caption,
      parse_mode: 'HTML'
    });
  }

  sendImgSource(buffer) {
    this.bot.telegram.sendPhoto(groupId, { source: buffer}, {
      caption: '📊 <b>Lunch Money Chart</b>',
      parse_mode: 'HTML'
    });
  }
}

module.exports = new TeleBotUtil();
