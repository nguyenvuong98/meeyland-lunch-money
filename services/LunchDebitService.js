const LunchDebitRepository  = require('../repository/lunch_debit.repository');

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
}

module.exports = new LunchDebitService();