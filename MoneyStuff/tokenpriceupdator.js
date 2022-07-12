const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb')
const Protocol = require('../Backend/Protocol.js');
const { findOne, findByIdAndUpdate } = require('../Backend/Protocol.js');
const GraphData = require("../Backend/GraphData");
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection



async function tokenUsdPrice() {
    
    var fullProtocolList = await Protocol.find()
    var idList = [""]
    var objectVersionFullProtocolList = []
    var graphdata
    for (let i = 0; i < fullProtocolList.length; i++) {

      
        objectVersionFullProtocolList[i] = fullProtocolList[i].toObject()
        graphdata = await getChartData(objectVersionFullProtocolList[i].gekoId)
        
        const data  = new GraphData({
          dates: graphdata[0],
          prices: graphdata[1],
        })

        await Protocol.findByIdAndUpdate(objectVersionFullProtocolList[i]._id, {graphData: data})

        idList[i] = objectVersionFullProtocolList[i].gekoId
    }
    // console.log(idList);
    let data = await CoinGeckoClient.coins.markets({
        ids: idList,
      });

      // console.log(data.data.length)
      // console.log(data.data)
    for (let i = 0; i < data.data.length; i++) {
      for (let j = 0; j < fullProtocolList.length; j++) {
      
          console.log(objectVersionFullProtocolList[i].gekoId)
        if (objectVersionFullProtocolList[i].gekoId === data.data[j].id){
          var ID = objectVersionFullProtocolList[i].claimAddress
          var price = data.data[j].current_price;
          await Protocol.findByIdAndUpdate( ID, {priceUsd: price})
        }
      }
    }

    console.log("PricesUpdated")
}


async function getChartData(address) {
  const params = {days: "7"}
  const result = await CoinGeckoClient.coins.fetchMarketChart(address, params);
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



module.exports = { tokenUsdPrice }