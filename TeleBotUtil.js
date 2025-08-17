const { Telegraf } = require("telegraf");
const { EventEmitter } = require('events');
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = process.env.TELEGRAM_PROXY;
const agent = new SocksProxyAgent(proxyUrl);
const groupId = process.env.TELEGRAM_GROUP_ID;
//const groupId = process.env.TELEGRAM_GROUP_ID_TEST;

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
    this.bot.command('help', async (ctx) => {
      let messageCommand = `/help show list command available\n`;
      messageCommand += `/showQR show QR code\n`;
      messageCommand += `/report show report each month, eg: /report | /report -m=7\n`;
      messageCommand += `/showTable show report as table (only current month)\n`;
      messageCommand += `/showPayment show all payment`;

      ctx.reply(messageCommand);
    });
    this.bot.command('report', async (ctx) => {
      const userId = ctx.from.id;
      const args = ctx.message.text.split(' ');
      let month = (new Date().getMonth()) + 1;
      const monthParams = args.find(item => item.includes('-m='));

      if (monthParams) {
        const monthValue = monthParams.split('=')[1];

        if (monthValue && parseInt(monthValue)) {
          month = parseInt(monthValue);
        }
      }
      //const member = await ctx.telegram.getChatMember(ctx.chat.id, userId);

      const sysMember = global.members.find( user => user.username ==ctx.from.username)

      if (!sysMember) return;
      this.emit('report', {
        userId: ctx.from.id,
        username: ctx.from.username,
        name: sysMember.name,
        month,
        message: ctx.message.text,
      });
    });

    this.bot.command('showTable', async (ctx) => {
      const userId = ctx.from.id;
      const args = ctx.message.text.split(' ');
      //const member = await ctx.telegram.getChatMember(ctx.chat.id, userId);

      const sysMember = global.members.find( user => user.username == ctx.from.username)

      if (!sysMember) return;
      this.emit('showTable', {
        userId: ctx.from.id,
        username: ctx.from.username,
        name: sysMember.name,
        message: ctx.message.text,
      });
    });

    this.bot.command('showPayment', async (ctx) => {
      const sysMember = global.members.find( user => user.username == ctx.from.username)

      if (!sysMember) return;
      this.emit('showPayment', {
        userId: ctx.from.id,
        username: ctx.from.username,
        name: sysMember.name,
        message: ctx.message.text,
      });
    });

    this.bot.command('showQR', async (ctx) => {
      this.emit('showQR', {});
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
