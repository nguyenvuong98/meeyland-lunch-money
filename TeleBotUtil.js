const { Telegraf } = require("telegraf");
const { EventEmitter } = require('events');
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = process.env.TELEGRAM_PROXY;
const agent = new SocksProxyAgent(proxyUrl);
//const groupId = process.env.TELEGRAM_GROUP_ID;
const groupId = process.env.TELEGRAM_GROUP_ID_TEST;

const ADMIN_ID = 1366333714;
const userTelegram = [];
class TeleBotUtil extends EventEmitter {
  constructor() {
    super();
    this.bot = new Telegraf(process.env.NEW_TELEGRAM_BOT_TOKEN, {
      telegram: {
        agent: agent
      }
    });
    this.bot.command('report', async (ctx) => {
      const userId = ctx.from.id;
      const args = ctx.message.text.split(' ');
      console.log('args msg', JSON.stringify(args))
      console.log('userId', userId);
      console.log('type userId', typeof userId);
      if (userId !== ADMIN_ID) return;
      //const member = await ctx.telegram.getChatMember(ctx.chat.id, userId);

      const sysMember = global.members.find( user => user.username ==ctx.from.username)

      if (!sysMember) return;
      this.emit('report', {
        userId: ctx.from.id,
        username: ctx.from.username,
        name: sysMember.name,
        message: ctx.message.text,
      });
      ctx.reply(`🆔 Your chat ID sdasd is: ${ctx.chat.id}`);
    });

    this.bot.launch();
  }

  async getUserInfor(ctx) {
    if (!ctx) return;

    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const member = await ctx.telegram.getChatMember(chatId, userId);

    userTelegram.push(member);
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
