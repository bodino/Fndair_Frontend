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
    const result = await api.coins.fetchCoinContractMarketChart(address, "ethereum");
    const prices = result.data.prices;
    const usdPrices = prices.map(price => {
        return price[1];
    })
    var date = new Date();
    var dates = [];
    const days = usdPrices.length
    for (let i = 0; i < days; i++) {
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
    console.log(dates)
    return [dates, usdPrices];
}

router.get('/', async function (req, res) {
    await Protocol.find(function (err, result) {
      if (result) {
        res.json(result)
      } else {
        res.json('No Projects Found')
      }
    })
})

//gets chart data for specific protocol
router.get('/:Address', (req, res) => {
    var toSend = getChartData(req.params.Address);
    req.json({
        dates: toSend[0],
        usdPrices: toSend[1]
    })
})

module.exports = router