const models = require('../models');

class MessageChatRepository {
    static async findInMonth(user_name = '') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const query = {
            user_name: user_name
        }
        query['createdAt'] = { '$gte': startOfMonth, '$lt': endOfMonth };

        return await models.lunch_debit.find(query);
    }

    static async create(obj) {
        if (!obj) return;

        return await models.lunch_debit.create(obj);
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

module.exports = MessageChatRepository;