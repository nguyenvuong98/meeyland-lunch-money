const models = require('../models');

class LuchMoneyRepository {
    static async aggregate(match) {
        const query = [
            {
                $match: match
            },
            {
                $group: {
                  _id: "$user_name",
                  totalAmount: { $sum: "$amount" },
                  count: { $sum: 1 }
                }
              },
            { $sort: { _id: 1 } }
        ];
        return models.lunch_money.aggregate(query);
    }

    static async aggregatePaymentStatus(user_name) {
        if(!user_name) return;
        const query =[
            {
            $match: {
                user_name,
                payment_status: {$in: [0,2]}
            }
            },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt"
                }
              },
              totalAmount: { $sum: "$amount" },
              records: {
                $push: {
                  user_name: "$user_name",
                  amount: "$amount",
                  payment_status: "$payment_status",
                  debit: "$debit",
                  createdAt: "$createdAt"
                }
              }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]

        return models.lunch_money.aggregate(query);
    }
    static async aggregateAll(userName) {
        const query = [
            {
                $match: {
                    user_name: userName,
                }
            },
            {
                $group: {
                  _id: { $year: "$createdAt" },
                  totalAmount: { $sum: "$amount" },
                  count: { $sum: 1 }
                }
              },
            { $sort: { _id: 1 } }
        ];
        return models.lunch_money.aggregate(query);
    }

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
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: {
                    '_id.month': -1,
                    '_id.userName': -1
                }
            }
        ];
        return models.lunch_money.aggregate(query);
    }

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

        return await models.lunch_money.find(query);
    }

    static async create(obj) {
        if (!obj) return;

        return await models.lunch_money.create(obj);
    }

    static async update(filter = {}, update = {}) {
        return await models.lunch_money.update(filter, update, {
            upsert: true
        });
    }

    static async updateMany(filter = {}, update = {}) {
        return await models.lunch_money.updateMany(filter, update);
    }

    static async count(query = {}) {
        return await models.lunch_money.countDocuments(query);
    }

    static async find(query = {}, sort = {}) {
        return await models.lunch_money.find(query).sort(sort);
    }
}

module.exports = LuchMoneyRepository;