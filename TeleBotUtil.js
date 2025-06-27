const { Telegraf } = require("telegraf");
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = process.env.TELEGRAM_PROXY;
const agent = new SocksProxyAgent(proxyUrl);
const groupId = process.env.TELEGRAM_GROUP_ID;

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

  sendImgUrl(url, caption) {
    if (!url) { return; }

    this.bot.telegram.sendPhoto(groupId, url, {
      caption: caption,
      parse_mode: 'HTML'
    });
  }
}

module.exports = new TeleBotUtil();
