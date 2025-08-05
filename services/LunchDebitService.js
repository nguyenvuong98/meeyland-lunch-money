const LunchDebitRepository  = require('../repository/lunch_debit.repository');
const moment = require('moment');

class LunchDebitService {
    async insertMany(input = []) {
        if (!input?.length) { return false}
        
        const record = [];
        const month = (new Date().getMonth()) + 1;
        input.forEach(item => {
            const insertData = {
                user_name: item.user_name,
                payment: item.payment,
                month: item.month ? parseInt(item.month) : month
            }
            record.push(insertData)
        })

        await LunchDebitRepository.insertMany(record)
        return { data: true};
    }

    async debtNotifi(input = []) {
        if (!input?.length) { return false}
        
        const record = [];
        const month = (new Date().getMonth()) + 1;
        input.forEach(item => {
            const insertData = {
                user_name: item.user_name,
                payment: item.payment,
                month: item.month ? parseInt(item.month) : month
            }
            record.push(insertData)
        })

        await LunchDebitRepository.insertMany(record)
        return { data: true};
    }

    async showPayment(user_name) {
        if (!user_name) { return }

        const data = await LunchDebitRepository.find({user_name});

        if (!data?.length) { return }

        let message = `<b>Payment info - ${user_name}</b>\n`

        data.forEach(item => {
            message += `Đã thanh toán <code>${item.payment}</code> cho tháng <b>${item.month}</b> vào ngày ${moment(item.createdAt).format('DD/MM/YYYY')}\n`;
        })

        return message;
    }
}

module.exports = new LunchDebitService();