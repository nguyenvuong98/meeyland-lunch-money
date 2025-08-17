const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');
const LunchMoneyRepository = require('../repository/lunch_money.repository');
const width = 600;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#fff' });
const TeleBotUtil = require("../TeleBotUtil");
const moment = require('moment');
function makeBoxTable(dates, rows) {
    // Example input:
    // dates = ["02/08","05/08","06/08","08/08","11/08","15/08"];
    // rows = [
    //   { label: "Nước", values: [34167, 28750, 0, 0, 0, 34000] },
    //   { label: "Ăn trưa", values: [70000, 40000, 40000, 77600, 90000, 35000] }
    // ]
  
    const headers = ["Date", ...rows.map(r => r.label)];
  
    // Build body: each date is one row
    const body = dates.map((d, i) => [
      d,
      ...rows.map(r => r.values[i].toString())
    ]);
  
    // compute column widths
    const colWidths = headers.map((h, i) =>
      Math.max(h.length, ...body.map(r => r[i].length))
    );
  
    function pad(text, width) {
      return text.padEnd(width, " ");
    }
  
    let out = "";
  
    // top border
    out += "┌" + colWidths.map(w => "─".repeat(w + 2)).join("┬") + "┐\n";
  
    // header row
    out += "│ " + headers.map((h, i) => pad(h, colWidths[i])).join(" │ ") + " │\n";
  
    // header separator
    out += "├" + colWidths.map(w => "─".repeat(w + 2)).join("┼") + "┤\n";
  
    // rows
    for (const r of body) {
      out += "│ " + r.map((c, i) => pad(c, colWidths[i])).join(" │ ") + " │\n";
    }
  
    // bottom border
    out += "└" + colWidths.map(w => "─".repeat(w + 2)).join("┴") + "┘\n";
  
    return `<pre>${out}</pre>`;
  }
  
class ChartService {
    async getReportUserData(user_name) {
        console.log('hereh')
        const lunchMoney = await LunchMoneyRepository.findInMonth(user_name);
        if (!lunchMoney && !lunchMoney.length) { return}
        const labels = []
        const dataValues = []
        const waterValues = []
        let totalMoney = 0;
        lunchMoney.forEach(item => {
            totalMoney += item.amount;
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
                waterValues[indexWater].value += item.amount
            } else {
                waterValues.push({
                    date: label,
                    value: item.amount
                })
            }
            if (indexData < 0) {
                dataValues.push({
                    date: label,
                    value: 0
                })
            }
        });

        return { labels, dataValues, waterValues, totalMoney}
    }
    async showChartByUser(user_name = '') {
        if (!user_name) { return; }

        const { labels, dataValues, waterValues, totalMoney} = await this.getReportUserData(user_name)

        await this.saveImgChart(user_name, totalMoney, labels, dataValues.map(item => item.value), waterValues.map(item => item.value))
        return true
    }

    async showTableByMonth(user_name = '', month, { totalMoneyLunch, totalMoneyWater, total, totalPayment}) {
        if (!user_name) { return; }

        const filterMonth = month ? month : new Date().getMonth() + 1;
        const money = total - totalPayment;
        const message = `<b>Tiền ăn tháng ${filterMonth}</b>\n<b>Tên:</b> ${user_name}\n<b>Tiền ăn:</b> <code>${totalMoneyLunch}</code>\n<b>Tiền nước:</b> <code>${totalMoneyWater}</code>\n<b>Tổng tiền:</b> <code>${total}</code>\n`
                        + `<b>Đã thanh toán</b>: <code>${totalPayment}</code>\n`
                        + `<b>${money >= 0 ? 'Còn thiếu' : 'Còn thừa'}</b>: <code>${Math.abs(money)}</code>`
        const { labels, dataValues, waterValues, totalMoney} = await this.getReportUserData(user_name)

        await this.sendTableByMonth(message, totalMoney, labels, dataValues.map(item => item.value), waterValues.map(item => item.value))
        return true
    }

    async sendTableByMonth(message, totalMoney = 0, labels = [], dataValues = [], waterValues = []) {
        let msg = message;
        const rows = [
            { label: "Nước", values: waterValues},
            { label: "Ăn trưa", values: dataValues},
        ]
        const table = makeBoxTable(labels, rows)
        msg += table

        await TeleBotUtil.sendMessageHTML(msg)

        return true;
    }

    async saveImgChart(user_name, totalMoney = 0, labels = [], dataValues = [], waterValues = []) {
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
                    text: `Biểu đồ tiêu tiền của ${user_name}: ${totalMoney}`,
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