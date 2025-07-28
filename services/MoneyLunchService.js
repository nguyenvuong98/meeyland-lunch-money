const LunchMoneyRepository = require('../repository/lunch_money.repository');
const LunchDebitRepository = require('../repository/lunch_debit.repository');

class LunchMoneyService {
    async create(input = []) {
        const proccess = [];

        input.forEach(item => {
            const insertData = {
                user_name: item.user_name,
                type: item.type,
                amount: item.amount,
                month: item.month ? item.month : (new Date().getMonth() + 1)
            }

            proccess.push(LunchMoneyRepository.create(insertData))
        })

        await Promise.all(proccess);
        return { data: true };
    }

    async reportUser(user_name, month) {
        if (!user_name) { return; }

        let records = []

        if (!month) {
            records = await LunchMoneyRepository.findInMonth(user_name);
        } else {
            records = await LunchMoneyRepository.find({ user_name, month})
        }

        let paymentRecord = []

        if (!month) {
            paymentRecord = await LunchDebitRepository.findInMonth(user_name);
        } else {
            paymentRecord = await LunchDebitRepository.find({user_name, month});
        }
        const totalPayment = paymentRecord.reduce((sum, item) => item.payment + sum, 0);

        const totalMoneyLunch = records.reduce((sum, item) => {
            return item.type === '0' ? sum + item.amount : sum;
        }, 0);

        const totalMoneyWater = records.reduce((sum, item) => {
            return item.type === '1' ? sum + item.amount : sum;
        }, 0);

        const total = totalMoneyLunch + totalMoneyWater;

        return { totalMoneyLunch, totalMoneyWater, total, totalPayment};
    }
}

module.exports = new LunchMoneyService();