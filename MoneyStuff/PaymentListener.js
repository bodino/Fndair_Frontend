const Web3 = require('web3')
const TokenArtifact = require('../USDC.json')
const mongoose = require('mongoose')
const { DateTime } = require('luxon')
const { MongoClient, ServerApiVersion } = require('mongodb')
const uri =
  'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri)
const Payment = require('../Backend/Payment.js')
const User = require('../Backend/User.js')

const options = {
  timeout: 30000, // ms

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: -1, // ms
  },

  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 1000, // ms
    maxAttempts: 10,
    onTimeout: false,
  },
}

async function findPayments(websocket, protocol) {
  var address = '0x46D14FA8fE262aDaB112F34852AaB430C53565e5'
  const web3 = new Web3(websocket, options)
  var food = 0
  const contract = new web3.eth.Contract(TokenArtifact.abi, address)

  await contract.events
    .Payment({ fromBlock: 12465423 })
    .on('data', (event) => setArray(event))

  async function setArray(event) {
    console.log(event)
    var fullProtocolList = await Payment.findById(protocol)

    var amountEthSent = web3.utils.fromWei(event.returnValues.amount, 'ether')

    var user = await User.findById(event.returnValues.user)
    console.log(user)
    var subscriptionLength = await checkvalue(fullProtocolList, amountEthSent)
    console.log(subscriptionLength)
    //if user doesn't exist in db
    if (user != null) {
      if (subscriptionLength != false) {
        if (user.subscriptionInfo.expirationDate) {
            if (DateTime.now().toJSDate().getTime() > user.subscriptionInfo.expirationDate.getTime()) {
            //reset subscription
            user.subscriptionInfo.status = 'true'
            user.subscriptionInfo.duration = subscriptionLength
            user.subscriptionInfo.payDate = DateTime.now().toJSDate()
            user.subscriptionInfo.expirationDate = DateTime.now().plus({ months: subscriptionLength }).toJSDate()
            user.save()

            } else {
            //add to current subscription length for currently active subscription
                user.subscriptionInfo.status = 'true'
                user.subscriptionInfo.duration = subscriptionLength + user.subscriptionInfo.duration
                user.subscriptionInfo.expirationDate = DateTime.fromJSDate(user.subscriptionInfo.expirationDate).plus({ months: subscriptionLength }).toJSDate()
                user.save()
            }
        } else {
            //make new subscription for existing user
            user.subscriptionInfo.status = 'true'
            user.subscriptionInfo.duration = subscriptionLength
            user.subscriptionInfo.payDate = DateTime.now().toJSDate()
            user.subscriptionInfo.expirationDate = DateTime.now().plus({ months: subscriptionLength }).toJSDate()
            user.save()
        }
      } else{
        console.log("incorrect payment amount")
      }
      
    } else {
        //make new subscription for nonexistant user
      if (subscriptionLength != false) {
        const newuser = new User({
          _id: event.returnValues.user,
          wallet: [event.returnValues.user],
          subscriptionInfo: {
            status: true,
            duration: subscriptionLength,
            payDate: DateTime.now().toJSDate(),
            expirationDate: DateTime.now().plus({ months: subscriptionLength }).toJSDate(),
          },
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
        })
        newuser.save()
      }
    }
  }
}

async function checkvalue(fullProtocolList, amountEthSent) {
  var subscriptionLength = '0'
  if (amountEthSent == fullProtocolList.amount1Month) {
    subscriptionLength = 1
  } else if (amountEthSent == fullProtocolList.amount6Month) {
    subscriptionLength = 6
  } else if (amountEthSent == fullProtocolList.amount12Month) {
    subscriptionLength = 12
  } else {
    subscriptionLength = false
  }
  return subscriptionLength
}

module.exports = { findPayments }
