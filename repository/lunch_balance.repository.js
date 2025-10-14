const models = require('../models');

class LunchBalanceRepository {
    static async findInMonth(user_name = '') {
        const month = (new Date().getMonth()) + 1;

        const query = {
            user_name,
            month
        }

        return await models.lunch_balance.find(query);
    }

    static async create(obj) {
        if (!obj) return;

        return await models.lunch_balance.create(obj);
    }

    static async insertMany(record = []) {
        if (!record?.length) return;

        return await models.lunch_balance.insertMany(record);
    }

    static async update(filter = {}, update = {}) {
        return await models.lunch_balance.updateOne(filter, update, {
            upsert: true
        });
    }

    static async count(query = {}) {
        return await models.lunch_balance.countDocuments(query);
    }

    static async find(query = {}, sort = {}) {
        return await models.lunch_balance.find(query).sort(sort);
    }
}

module.exports = LunchBalanceRepository;