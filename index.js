const express = require('express');
const bodyParser = require('body-parser')
require('dotenv').config();
const TelegramService = require('./services/TelegramService');
const TeleBotUtil = require("./TeleBotUtil");
const LunchMoneyService = require('./services/MoneyLunchService');
const LunchDebitService = require('./services/LunchDebitService');
const ChartService = require('./services/ChartService');

global.members = [
  {
      name: 'vuongnv',
      tag: '@vuongnv98',
      username: 'vuongnv98',
  },
  {
      name: 'ngocnd',
      tag: '@ngocnd95',
      username: 'ngocnd95',
  },
  {
      name: 'longng',
      tag: '@hin2510',
      username: 'hin2510',
  },
  {
      name: 'dungnt',
      tag: '@dungnt1709',
      username: 'dungnt1709',
  },
  {
      name: 'tule',
      tag: '@tule111',
      username: 'tule111',
  },
  {
      name: 'hunghoang',
      tag: '@hungu1099',
      username: 'hungu1099',
  }
]
const app = express()
app.use(bodyParser.json())
app.set('views', 'views');
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/lunch', function(req, res) {
  res.render('lunch');
});

app.get('/payment', function(req, res) {
  res.render('payment');
});

app.post('/notify-telegram', async function(req, res) {
  const {title, members, total, showQr} = req.body;
  await TelegramService.sendLunchMoney(title, members, total, showQr);
  res.json({data: true})
});

app.post('/luch-money', async function(req, res) {
  const body = req.body
  console.log('body', body)
  const data = await LunchMoneyService.create(req.body);
  res.json({data})
});

app.post('/chart-by-user', async function(req, res) {
  const {user_name} = req.body
  const data = await ChartService.showChartByUser(user_name);
  res.json({data})
});

app.post('/report-by-user', async function(req, res) {
  const {user_name, month} = req.body
  const data = await LunchMoneyService.reportUser(user_name, month);
  await TelegramService.sendReportByMonth({user_name, month, ...data})
  res.json({data})
});

app.post('/payment', async function(req, res) {
  const body = req.body
  const data = await LunchDebitService.insertMany(body);
  await TelegramService.sendUserPayment(body);
  res.json({data})
});

app.post('/debt', async function(req, res) {
  const {user_name, month} = req.body
  const data = await LunchMoneyService.reportUser(user_name, month);
  await TelegramService.sendDebtNotifi({data, userName: user_name, month})
  res.json({data: true})
});

app.listen(3000, () => {
  console.log(process.env.TELEGRAM_BOT_TOKEN);
  console.log('server listen port 3000')
})



TeleBotUtil.on('report', async (message) => {
  console.log('📩 Received notifyEvent:', message);
  const user_name = message?.name;
  const month = 7;
  const data = await LunchMoneyService.reportUser(user_name, month);
  await TelegramService.sendReportByMonth({user_name, month, ...data})
  // Optional: reply back;
})