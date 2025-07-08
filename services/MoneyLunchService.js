const LunchMoneyRepository = require('../repository/lunch_money.repository');

class LunchMoneyService {
    async create(input = []) {
        const proccess = [];

        input.forEach(item => {
            const insertData = {
                user_name: item.user_name,
                type: item.type,
                amount: item.amount
            }
            proccess.push(LunchMoneyRepository.create(insertData))
        })

        await Promise.all(proccess);
        return { data: true };
    }

    async reportUser(user_name) {
        if (!user_name) { return; }

        const records = await LunchMoneyRepository.findInMonth(user_name);

        const totalMoneyLunch = records.reduce((sum, item) => {
            return item.type === '0' ? sum + item.amount : sum;
        }, 0);

        const totalMoneyWater = records.reduce((sum, item) => {
            return item.type === '1' ? sum + item.amount : sum;
        }, 0);

        const total = totalMoneyLunch + totalMoneyWater;

        return { totalMoneyLunch, totalMoneyWater, total};
    }
}

module.exports = new LunchMoneyService();