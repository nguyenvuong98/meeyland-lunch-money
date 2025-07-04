const LunchMoneyRepository  = require('../repository/lunch_debit.repository');

class LunchMoneyService {
    async create(input = []) {
        console.log('here')
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
        return { data: true};
    }
}

module.exports = new LunchMoneyService();