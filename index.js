const express = require('express');
const bodyParser = require('body-parser')
require('dotenv').config();
const TelegramService = require('./TelegramService');

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

app.post('/notify-telegram', async function(req, res) {
  const {title, members, total, showQr} = req.body;
  await TelegramService.sendLunchMoney(title, members, total, showQr);
  res.json({data: true})
});

app.listen(3000, () => {
  console.log(process.env.TELEGRAM_BOT_TOKEN);
  console.log('server listen port 3000')
})