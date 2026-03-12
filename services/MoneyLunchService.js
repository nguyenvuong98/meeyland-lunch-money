const LunchMoneyRepository = require('../repository/lunch_money.repository');
const LunchDebitRepository = require('../repository/lunch_debit.repository');
const LunchBalanceService = require('./LunchBalanceService');
const ChatBotService = require('./ChatBotService');
const {getDateFilter} = require('../util');
const LuchMoneyRepository = require('../repository/lunch_money.repository');
const LunchDebitService = require('./LunchDebitService');

class LunchMoneyService {
    mappingDebit(amounts = [], debits = []) {
        const result = [];

        if (!amounts?.length) return;

        amounts.forEach(user => {
            if (!user._id || user._id === 'null') return;
            const debitItem = debits.find(x => x._id === user._id);
            const tag = global.members.find(x => x.name == user._id);
            const item = {
                userName: tag ? tag.tag : user._id,
                totalAmount: user.totalAmount,
                totalPayment: debitItem?.totalPayment,
                debit: debitItem?.totalPayment - user.totalAmount,
            }

            result.push(item);
        })

        return result;
    }
    
    async getDebitDetail(user_name) {
        if (!user_name) return;

        const aggLunchMoney = await LuchMoneyRepository.aggregatePaymentStatus(user_name);

        if (!aggLunchMoney?.length) return;

        const partialpaymentIndex = aggLunchMoney.findIndex(x => x?.records[0].payment_status === 2);
        let partialItem = null;
        if (partialpaymentIndex !== -1) {
            partialItem = {
                _id: aggLunchMoney[partialpaymentIndex]._id,
                totalAmount: aggLunchMoney[partialpaymentIndex].totalAmount,
                ...aggLunchMoney[partialpaymentIndex].records[0]
            };
            aggLunchMoney.splice(partialpaymentIndex, 1)
        }

        if(!aggLunchMoney.length) return {userName: user_name, partialItem}
        const fromDate = aggLunchMoney[0]._id;
        const toDate = aggLunchMoney[aggLunchMoney.length -1]._id;
        let totalDebit = aggLunchMoney.reduce((sum, item) => sum + item.totalAmount, 0);
       
        return {userName: user_name, partialItem, fromDate, toDate, totalDebit}
    }

    async sendNPLPaymentMessage(message = '', currentUser = null) {
        if (!message) return;
        const extractData = await ChatBotService.extractPaymentQuery(message, currentUser);

        if (!extractData?.paymentInfo?.length) return

        await LunchDebitService.insertMany(extractData.paymentInfo)


        return extractData?.paymentInfo;
    }
    async sendNPLMessage(message = '', currentUser = null) {
        if (!message) return;
        
        const objectFilter = await ChatBotService.extractQuery(message, currentUser);

        if (!objectFilter) return;

        const process = [];
        const intentFilter = objectFilter.intent;
        let filter = {}
        let result = 'Ngoài phạm vi trả lời';
        const fromDate = getDateFilter(objectFilter.day, objectFilter.month - 1, objectFilter.year);
        const toDate = new Date();
        switch (intentFilter) {
            case 'total_amount':
                filter = {
                    'lunch_money': {
                        createdAt: objectFilter.filterRange == 0 ? fromDate : {$gte: fromDate, $lte: toDate}
                    }
                }
                if (objectFilter?.user_names?.length > 0) {
                    filter['lunch_money'] ['user_name'] = {$in: objectFilter.user_names}
                }
                result = await  LunchMoneyRepository.aggregate(filter['lunch_money']);
                break;
            case 'total_payment':
                filter = {
                    'lunch_debit': {
                        user_name: {$in: objectFilter.user_names},
                    }
                }
                result = await LunchDebitRepository.find(filter['lunch_debit'])
                break;
            case 'total_debit':
                filter = {
                    'lunch_money': {
                        
                    },
                    'lunch_debit': {
                       
                    }
                }

                if (objectFilter?.user_names?.length > 0) {
                    filter['lunch_money'] ['user_name'] = {$in: objectFilter.user_names}
                    filter['lunch_debit'] ['user_name'] = {$in: objectFilter.user_names}
                }
                process.push(LunchMoneyRepository.aggregate(filter['lunch_money']))
                process.push(LunchDebitRepository.aggregate(filter['lunch_debit']))
                const data = await Promise.all(process);
                const mappingData = this.mappingDebit(data[0], data[1]);
                result = await ChatBotService.answerDebit(mappingData)
                break;
            default:
                break;
        }

        return result;
    }

    async reportAllByUser(userName) {
        if (!userName) return;

        const lunchMoney = await LunchMoneyRepository.aggregateAll(userName);
        const debit = await LunchDebitRepository.aggregateAll(userName);

        let totalPayment = debit?.length ? debit[0].totalPayment : 0;
        lunchMoney.forEach(item => {
            item.debit = item.totalAmount <= totalPayment ? 0 : Math.abs(item.totalAmount - totalPayment);
            totalPayment = totalPayment > item.totalAmount ? Math.abs(totalPayment - item.totalAmount) : 0;
        })
        return {lunchMoney, debit}
    }

    async reportByYear(userName, year) {
        const currentYear = year || new Date().getFullYear();

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
                item.totalPayment = 0;
                totalDebit += item.totalAmount;
                item.debit = item.totalAmount;
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
                debit: item.amount,
                month: item.month ? item.month : (new Date().getMonth() + 1)
            }

            proccess.push(LunchMoneyRepository.create(insertData));
            proccess2.push(LunchBalanceService.create(item.user_name, parseInt(`-${item.amount}`)));
        })

        await Promise.all(proccess);
        Promise.all(proccess2);
        return { data: true };
    }

    async reportUserLLM(user_name) {
        if (!user_name) { return; }

        const filter = {
            'lunch_money': {
                user_name
            },
            'lunch_debit': {
                user_name
            }
        }

        const process = [
            LunchMoneyRepository.aggregate(filter['lunch_money']),
            LunchDebitRepository.aggregate(filter['lunch_debit'])
        ]

        const data = await Promise.all(process);
        const mappingData = this.mappingDebit(data[0], data[1]);
        const result = await ChatBotService.answerDebit(mappingData)

        return result;
    }
    async reportUser(user_name, month) {
        if (!user_name) { return; }

        let records = []

        if (!month) {
            records = await LunchMoneyRepository.findInMonth(user_name);
        } else {
            records = await LunchMoneyRepository.find({ user_name, month})
        }

        const aggPayment = await LunchDebitRepository.aggregate({user_name});
        const aggAmount = await LuchMoneyRepository.aggregate({user_name});
        const totalPayment = aggPayment?.length > 0 ?aggPayment[0].totalPayment : 0;
        const totalMoneyLunch = records.reduce((sum, item) => {
            return item.type === '0' ? sum + item.amount : sum;
        }, 0);

        const totalMoneyWater = records.reduce((sum, item) => {
            return item.type === '1' ? sum + item.amount : sum;
        }, 0);

        const total = aggAmount?.length > 0 ?aggAmount[0].totalAmount : 0;

        return { totalMoneyLunch, totalMoneyWater, total, totalPayment};
    }

    async getList(filter = {}) {
        return LuchMoneyRepository.find(filter);
    }

    async updateMany(filter = {}, body = {}) {
        return LuchMoneyRepository.updateMany(filter, body);
    }
}

module.exports = new LunchMoneyService();