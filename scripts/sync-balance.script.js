
require('dotenv').config();
const LunchMoneyService = require('../services/MoneyLunchService');
const LunchDebitService = require('../services/LunchDebitService');
const LunchBalanceService = require('../services/LunchBalanceService');

const users = [
  {
    id: 1366333714,
    name: 'vuongnv',
    tag: '@vuongnv98',
    username: 'vuongnv98',
  },
  {
    id: 7216384291,
    name: 'ngocnd',
    tag: '@ngocnd95',
    username: 'ngocnd95',
  },
  {
    id: 1924243844,
    name: 'longng',
    tag: '@hin2510',
    username: 'hin2510',
  },
  {
    id: 7661343004,
    name: 'dungnt',
    tag: '@dungznt',
    username: 'dungznt',
  },
  {
    id: 627477895,
    name: 'tule',
    tag: '@tule111',
    username: 'tule111',
  },
  {
    id: 5722947901,
    name: 'hunghoang',
    tag: '@hungu1099',
    username: 'hungu1099',
  }
]
const run = async () => {
  console.log('START sync balance')
  try {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const process = await Promise.all([
        LunchDebitService.aggregate({ user_name: user.name }),
        LunchMoneyService.getList({ user_name: user.name }, { createdAt: 1 })
      ])
      const userPayment = process[0][0];
      const lunchRecords = process[1];
      console.log('userPayment', userPayment);
      let balance = userPayment?.totalPayment;
      console.log('balance', balance);

      const paidIds = [];
      let partialIds = {};
      lunchRecords.forEach(item => {
        balance = balance - item.amount;

        if (balance >= 0 ) {
          paidIds.push(item._id);
        } else if (balance < 0 && Math.abs(balance) < item.amount) {
          partialIds = {
            _id: item._id,
            debit: Math.abs(balance) > item.amount ? item.amount : Math.abs(balance)
          };
        }
        if (balance <=0 ) return;
      })

      if (paidIds?.length) {
        console.log('update paidIds', paidIds.length);
        await LunchMoneyService.updateMany({_id: {$in: paidIds }}, {payment_status: 1, debit: 0})
      }

      if (partialIds._id) {
        console.log('update partialIds', partialIds._id);
        await LunchMoneyService.updateMany({_id: partialIds._id}, {payment_status: 2, debit: partialIds.debit})
      }
    }

  } catch (e) {
    console.log('error', e)
    process.exit()
  }
  console.log('END sync balance')
  process.exit()
}

run();