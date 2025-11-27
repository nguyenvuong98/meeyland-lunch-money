const models = require('../models');

class LunchDebitRepository {
    static async aggregateByYear(year, userName) {
        const query = [
            {
                $match: {
                    user_name: userName,
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lt: new Date(year + 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        userName: '$user_name',
                        month: '$month'
                    },
                    totalPayment: { $sum: '$payment' }
                }
            },
            {
                $sort: {
                    '_id.month': -1,
                    '_id.userName': -1
                }
            }
        ];

        return models.lunch_debit.aggregate(query);
    }

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

    static async find(query = {}) {
        return await models.lunch_debit.find(query);
    }
}

module.exports = LunchDebitRepository;