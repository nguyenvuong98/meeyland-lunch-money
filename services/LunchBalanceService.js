const LunchBalanceRepository  = require('../repository/lunch_balance.repository');

class LunchBalanceService {
    async create(user_name, amount = 0) {
        if (!user_name) { return }

        await LunchBalanceRepository.update({user_name}, {'$inc': {balance: amount}});

        return true;
    }

    async ranking() {
        const records = await LunchBalanceRepository.find({}, {balance: 1});
        return records;
    }
}

module.exports = new LunchBalanceService();