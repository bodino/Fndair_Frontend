const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()
const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb')
const Protocol = require('../Backend/Protocol.js')
const Payment = require('../Backend/Payment.js')
const User = require('../Backend/User.js')


const { findOne, findByIdAndUpdate } = require('../Backend/Protocol.js')
const uri =
  'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri)
var db = mongoose.connection

//to add new payment methods
// const payment = new Payment({
//   _id: "matic-network",
//   geckoId: "matic-network",
//   lastCheckedBlock: 0,
//   amount1Month:0,
//   amount6Month:0,
//   amount12Month:0,
//   updatedAt: new Date(),
// })

// payment.save();

async function subscriptionPrice() {
  const oneMonth = 28
  const sixMonth = 144
  const twelveMonth = 216
  var fullProtocolList = await Payment.find()
  var idList = ['']
  var objectVersionFullProtocolList = []
  for (let i = 0; i < fullProtocolList.length; i++) {
    objectVersionFullProtocolList[i] = fullProtocolList[i].toObject()
    idList[i] = objectVersionFullProtocolList[i].geckoId
  }
  let data = await CoinGeckoClient.coins.markets({
    ids: idList,
  })

  console.log(data.data)
  for (let i = 0; i < data.data.length; i++) {
    var ID = data.data[i].id
    var price = data.data[i].current_price

    var oneMonthPriceInToken = oneMonth / price
    var sixMonthPriceInToken = sixMonth / price
    var twelveMonthPriceInToken = twelveMonth / price
    await Payment.findByIdAndUpdate(ID, {
      amount1Month: oneMonthPriceInToken,
      amount6Month: sixMonthPriceInToken,
      amount12Month: twelveMonthPriceInToken,
    })
  }
}

module.exports = { subscriptionPrice }
