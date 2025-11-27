const LunchMoneyRepository = require('../repository/lunch_money.repository');
const LunchDebitRepository = require('../repository/lunch_debit.repository');
const LunchBalanceService = require('./LunchBalanceService');

class LunchMoneyService {
    async reportByYear(userName) {
        const currentYear = new Date().getFullYear();

        const moneyData = await LunchMoneyRepository.aggregateByYear(currentYear, userName);
        const paymentData = await LunchDebitRepository.aggregateByYear(currentYear, userName);

        const data = [];
        let totalAmount = 0;
        let totalPayment = 0;
        let totalDebit = 0;
        moneyData.forEach(item => {
            item.userName = item._id.userName;
            const monthIndex = data.findIndex(x => x.month == item._id.month);

            if (monthIndex < 0) {
                data.push({month: item._id.month});
            }

            const monthIndex2 = data.findIndex(x => x.month == item._id.month);
            const paymentItem = paymentData.find(x => item._id.userName == x._id.userName && item._id.month == x._id.month);
            totalAmount += item.totalAmount;

            if (!paymentItem) {
                data[monthIndex2] = {...data[monthIndex2], ...item}
                //data[monthIndex2].push(item);
                return;
            }

            totalPayment += paymentItem.totalPayment;
            item.totalPayment = paymentItem.totalPayment;
            item.debit = item.totalAmount - item.totalPayment;
            totalDebit += item.debit;
            data[monthIndex2] = {...data[monthIndex2], ...item}
        })

        return {data, totalDebit, totalPayment, totalAmount};
    }

    async create(input = []) {
        const proccess = [];
        const proccess2 = [];

        input.forEach(item => {
            const insertData = {
                user_name: item.user_name,
                type: item.type,
                amount: item.amount,
                month: item.month ? item.month : (new Date().getMonth() + 1)
            }

            proccess.push(LunchMoneyRepository.create(insertData));
            proccess2.push(LunchBalanceService.create(item.user_name, parseInt(`-${item.amount}`)));
        })

        await Promise.all(proccess);
        Promise.all(proccess2);
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