const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');
const LunchMoneyRepository = require('./repository/lunch_money.repository');
const width = 600;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#fff' });
const TeleBotUtil = require("./TeleBotUtil");
const moment = require('moment');

class ChartService {
    async showChartByUser(user_name = '') {
        if (!user_name) { return; }

        const lunchMoney = await LunchMoneyRepository.findInMonth(user_name);
        if (!lunchMoney && !lunchMoney.length) { return}
        const labels = []
        const dataValues = []
        const waterValues = []
        lunchMoney.forEach(item => {
            const label = moment(item.createdAt).format('DD/MM');
            if (!labels.includes(label)) {
                labels.push(label)
            }

            const indexData = dataValues.findIndex(data => data.date === label);
            const indexWater = waterValues.findIndex(data => data.date === label);
            if (item.type === '0') {
                if (indexData >= 0) {
                    dataValues[indexData].value += item.amount
                } else {
                    dataValues.push({
                        date: label,
                        value: item.amount
                    })
                }

                if (indexWater < 0) {
                    waterValues.push({
                        date: label,
                        value: 0
                    })
                }
                return;
            }
            

            

            if (indexWater >= 0) {
                waterValues[indexData].value += item.amount
            } else {
                waterValues.push({
                    date: label,
                    value: item.amount
                })
            }
            if (!indexData) {
                dataValues.push({
                    date: label,
                    value: 0
                })
            }
        });

        await this.saveImgChart(user_name, labels, dataValues.map(item => item.value), waterValues.map(item => item.value))
        return true
    }

    async sendReportByMonth() {

    }

    async saveImgChart(user_name, labels = [], dataValues = [], waterValues = []) {
        // Chart config
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tiền ăn trưa',
                    data: dataValues,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                },
                {
                    label: 'Tiền nước',
                    data: waterValues,
                    borderColor: 'orange',
                    fill: false,
                }]
            },
            options: {
                responsive: false,
                plugins: {
                  title: {
                    display: true,
                    text: `Biểu đồ vung tiền của ${user_name}`,
                  }
                }
              }
        };

        // Render and save
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
        //fs.writeFileSync('chart.png', imageBuffer);

        await TeleBotUtil.sendImgSource(imageBuffer)
    }
}

module.exports = new ChartService();