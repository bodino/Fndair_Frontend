const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const Protocol = require("./Protocol")
const CoinGecko = require('coingecko-api');

mongoose.connect('mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

const api = new CoinGecko();

async function tokenUsdPrice(address, num) {
    const result = await api.coins.fetchCoinContractInfo(address);
    const priceUsd = result.data.market_data.current_price.usd * num;
    console.log(priceUsd);
    return priceUsd.toFixed(2);
}

const testAdd = "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC"
//gets dates and price history
//return array index 0 => dates, index 1 => prices
async function getChartData(address, numDays) {
    var params = {vs_currency: "usd", days: numDays};
    const result = await api.coins.fetchCoinContractMarketChart(address, "ethereum", params);
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
getChartData(testAdd, "3")