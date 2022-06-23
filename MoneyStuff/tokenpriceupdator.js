const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb')
const Protocol = require('../Backend/Protocol.js');
const { findOne, findByIdAndUpdate } = require('../Backend/Protocol.js');
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection



async function tokenUsdPrice() {
    
    var food = await Protocol.find()
    var idList = [""]
    var bob = []
    for (let i = 0; i < food.length; i++) {
      
     bob[i] = food[i].toObject()
        idList[i] = bob[i].geckoId
    }
    let data = await CoinGeckoClient.coins.markets({
        ids: idList,
      });

      console.log(data.data.length)
    for (let i = 0; i < data.data.length; i++) {
      for (let j = 0; j < food.length; j++) {
      
        if (bob[i].geckoId === data.data[j].id){
          var ID = bob[i].claimAddress
          var price = data.data[j].current_price;
          await Protocol.findByIdAndUpdate( ID, {priceUsd: price})
        }
      }
    }

    console.log("PricesUpdated")
}



module.exports = { tokenUsdPrice }