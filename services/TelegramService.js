const TeleBotUtil = require("../TeleBotUtil");
const LunchMoneyService = require('./MoneyLunchService');
const moment = require('moment');
const TAGS  = [
    {
        name: 'vuongnv',
        tag: '@vuongnv98',
        username: 'vuongnv98',
    },
    {
        name: 'ngocnd',
        tag: '@ngocnd95',
        username: 'ngocnd95',
    },
    {
        name: 'longng',
        tag: '@hin2510',
        username: 'hin2510',
    },
    {
        name: 'dungnt',
        tag: '@dungznt',
        username: 'dungznt',
    },
    {
        name: 'tule',
        tag: '@tule111',
        username: 'tule111',
    },
    {
        name: 'hunghoang',
        tag: '@hungu1099',
        username: 'hungu1099',
    }
]

class TelegramService {
    async sendReportByYearTemplate(data, userName) {
        if (!data) return;

        const tag = TAGS.find(x => x.name === userName);
        const currentYear = new Date().getFullYear();
        let msg = `<b>${userName}:${tag.tag} - ${currentYear}:</b>\n`;
        msg += `<b>Đã chi:</b> <code>${data.totalAmount}</code> vnđ\n`;
        msg += `<b>Đã thanh toán:</b> <code>${data.totalPayment}</code> vnđ\n`;
        if (data.totalDebit > 0) {
            msg += `<b>Còn thiếu:</b> <code>${data.totalDebit}</code> vnđ\n`;
        }
        msg += '\n';
        data?.data.forEach(item => {
            msg += `<b>Tháng ${item.month}:</b>`;
            msg += `  đã chi: <code>${item.totalAmount}</code> vnđ,`;
            if (item.debit > 0) {
                msg += `  đã trả: <code>${item.totalPayment}</code> vnđ,`;
                msg += `  còn thiếu: <code>${item.debit}</code> vnđ`;
            } else if (item.debit < 0) {
                msg += `  còn thừa: <code>${Math.abs(item.debit)}</code> vnđ`;
            } else {
                msg += `  Đã thanh toán.`;
            }
            
            msg += '\n';
        })

        await TeleBotUtil.sendMessageHTML(msg);

        return true;
    }
    async sendLunchMoney(title, members, total, showQr = true) {
        try{
            LunchMoneyService.create(members);
            const memberName = members.map(user => user.user_name).join(', ');
            if (showQr) {
                //const myQrUrl = 'https://static.meeyid.com/uploads/8043b789-5c60-4feb-ba53-289c4a77659b.png';
                const formatted = moment().format('YYYY-MM-DD HH:mm:ss');
                const caption = `<b>${title  ||'Lunch money'}</b>\n<b>Mã QR:</b>    /showQR\n<b>Xem báo cáo:</b>    /report\n<b>Total:</b> <code>${total}</code>\n<b>Member:</b> ${memberName}\n<b>Date:</b> ${formatted}`;
                await TeleBotUtil.sendMessageHTML(caption);
            } else {
                await TeleBotUtil.sendLogMessage(title);
            }
            
            return true;
        } catch(error) {
            console.error('sendLunchMoney error', error);
        }
    }

    async sendReportByMonth({user_name, month, totalMoneyLunch, totalMoneyWater, total, totalPayment}) {
        if (!user_name) { return }

        const filterMonth = month ? month : new Date().getMonth() + 1;
        const money = total - totalPayment;
        const message = `<b>Báo cáo tháng ${filterMonth}</b>\n<b>Tên:</b> ${user_name}\n<b>Tiền ăn:</b> <code>${totalMoneyLunch}</code>\n<b>Tiền nước:</b> <code>${totalMoneyWater}</code>\n<b>Tổng tiền:</b> <code>${total}</code>\n`
                        + `<b>Đã thanh toán</b>: <code>${totalPayment}</code>\n`
                        + `<b>${money >= 0 ? 'Còn thiếu' : 'Còn thừa'}</b>: <code>${Math.abs(money)}</code>\n`
                        + `<b>Xem chi tiêu trong năm:</b>  /me\n`
                        + `<b>Xem chi tiết:</b>  /showTable`
        await TeleBotUtil.sendMessageHTML(message);
        return true;
    }

    async sendUserPayment(input = []) {
        if (!input?.length) { return }

        const month = new Date().getMonth() +1;
        let message = '<b>Payment notify</b>\n'
        input.forEach(item => {
            message += `${item.user_name} đã thanh toán tiền ăn tháng ${item.month ? item.month : month}: <code>${item.payment}</code> vnd\n`
        })

        await TeleBotUtil.sendMessageHTML(message);
        return true;
    }

    async sendDebtNotifi({data, userName, month}) {
        if (!data || !userName) return;

        const targetMonth = month ? month : new Date().getMonth() + 1;
        const {totalMoneyLunch, totalMoneyWater, total, totalPayment} = data;
        const money = total - totalPayment;
        const TAGS  = [
            {
                name: 'vuongnv',
                tag: '@vuongnv98',
                username: 'vuongnv98',
            },
            {
                name: 'ngocnd',
                tag: '@ngocnd95',
                username: 'ngocnd95',
            },
            {
                name: 'longng',
                tag: '@hin2510',
                username: 'hin2510',
            },
            {
                name: 'dungnt',
                tag: '@dungnt1709',
                username: 'dungnt1709',
            },
            {
                name: 'tule',
                tag: '@tule111',
                username: 'tule111',
            },
            {
                name: 'hunghoang',
                tag: '@hungu1099',
                username: 'hungu1099',
            }
        ]
        const tag = TAGS.find(x => x.name === userName);

            if(!tag) return;

        const childMsg = `${ money == 0 ? 'Đã thanh toán đầy đủ':  money > 0 ? 'Còn thiếu' : 'Còn thừa'}`;
        let message = `${tag.tag} tháng ${targetMonth}  ${childMsg} <code>${Math.abs(money)}</code>\n`;
        message += `<b>Xem thông tin thanh toán:</b> /showPayment`
        // if (money >= 0) {
        //     message += `<b>MAU TRẢ NỢ!</b>`
        // }
        await TeleBotUtil.sendMessageHTML(message)

        return true
    }
}

module.exports = new TelegramService();