const TeleBotUtil = require("./TeleBotUtil");
const moment = require('moment');
class TelegramService {
    async sendLunchMoney(title, members, total, showQr = true) {
        try{
            if (showQr) {
                const myQrUrl = 'https://static.meeyid.com/uploads/8043b789-5c60-4feb-ba53-289c4a77659b.png';
                const formatted = moment().format('YYYY-MM-DD HH:mm:ss');
                const caption = `<b>${title  ||'Lunch money'}</b>\n<b>Total:</b> <code>${total}</code>\n<b>Member:</b> ${members}\n<b>Date:</b> ${formatted}`;
                await TeleBotUtil.sendImgUrl(myQrUrl, caption);
            } else {
                await TeleBotUtil.sendLogMessage(title);
            }
            
            return true;
        } catch(error) {
            console.error('sendLunchMoney error', error);
        }
    }
}

module.exports = new TelegramService();