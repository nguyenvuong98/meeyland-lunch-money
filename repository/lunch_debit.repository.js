const models = require('../models');

class LunchDebitRepository {
    static async findInMonth(user_name = '') {
        const month = (new Date().getMonth()) + 1;

        const query = {
            user_name,
            month
        }

        return await models.lunch_debit.find(query);
    }

    static async create(obj) {
        if (!obj) return;

        return await models.lunch_debit.create(obj);
    }

    static async insertMany(record = []) {
        if (!record?.length) return;

        return await models.lunch_debit.insertMany(record);
    }

    static async update(filter = {}, update = {}) {
        return await models.lunch_debit.update(filter, update, {
            upsert: true
        });
    }

    static async count(query = {}) {
        return await models.lunch_debit.countDocuments(query);
    }
}

module.exports = LunchDebitRepository;