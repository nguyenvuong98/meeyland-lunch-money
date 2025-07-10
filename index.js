const express = require('express');
const bodyParser = require('body-parser')
require('dotenv').config();
const TelegramService = require('./services/TelegramService');
const LunchMoneyService = require('./services/MoneyLunchService');
const LunchDebitService = require('./services/LunchDebitService');
const ChartService = require('./services/ChartService');

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
  const {user_name} = req.body
  const data = await LunchMoneyService.reportUser(user_name);
  await TelegramService.sendReportByMonth({user_name, ...data})
  res.json({data})
});

app.post('/payment', async function(req, res) {
  const body = req.body
  const data = await LunchDebitService.insertMany(body);
  await TelegramService.sendUserPayment(body)
  res.json({data})
});

app.listen(3000, () => {
  console.log(process.env.TELEGRAM_BOT_TOKEN);
  console.log('server listen port 3000')
})