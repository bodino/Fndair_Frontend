const express = require('express');
const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb')
const CoinGecko = require('coingecko-api');
const Protocol = require('../Backend/Protocol.js')

const api = new CoinGecko();
const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection

async function getChartData(address) {
    const params = {days: "7"}
    const result = await api.coins.fetchMarketChart(address, params);
    var prices = [];
    result.data.prices.forEach((price, index) => {
        if (index % 23 === 0 && index != 0) {
            prices.push(price[1])
        }
    })

    var date = new Date();
    var dates = [];
    const days = 7
    for (let i = 1; i <= days; i++) {
        var day = date.getDate() - (days - i);
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if (day < 1 && month % 2 === 1) {
            day = 31 + day
            month = month - 1
        } else if (day < 1 && month % 2 === 0) {
            day = 30 + day
            month = month - 1
        }
        if (month < 1) {
            month = 12
            year = year - 1
        }
        var dd = String(day).padStart(2, '0');
        var mm = String(month).padStart(2, '0');
        var yyyy = year;
        dates.push(mm + '/' + dd + '/' + yyyy);
    }
    return [dates, prices];
}

router.get('', async function (req, res) {
    await Protocol.find(function (err, result) {
      if (result) {
        res.json(result)
      } else {
        res.json('No Projects Found')
      }
    })
})


//gets chart data for specific protocol
router.get('/:Address', async (req, res) => {
    var toSend = await getChartData(req.params.Address);
    res.json({
        "dates": toSend[0],
        "usdPrices": toSend[1]
    })
})

module.exports = router