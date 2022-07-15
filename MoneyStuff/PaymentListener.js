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
const PaymentNetwork = require('../Backend/PaymentNetwork.js')


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

async function findPayments(websocket, protocol, network) {
  var address = '0xA14d175d92011C63478b9107Bd1C552e4a47c9F2'
  const web3 = new Web3(websocket, options)
  var food = 0
  const contract = new web3.eth.Contract(TokenArtifact.abi, address)
  var paymentNetwork = await PaymentNetwork.findById(network)

  console.log(paymentNetwork.lastCheckedBlock)

  await contract.getPastEvents('Payment', { fromBlock: paymentNetwork.lastCheckedBlock }, function(error, events){ })
  .then(async function(events){
    for (var i = 0; i < events.length; i++) {
        if (events[i].blockNumber > paymentNetwork.lastCheckedBlock) {
            setArray(events[i])
        }
     if (i+1 == events.length){
        lastCheckedBlock = events[i].blockNumber;
        await PaymentNetwork.findByIdAndUpdate(network, {lastCheckedBlock: lastCheckedBlock})
     }
    }
  });

    // .Payment({ fromBlock: paymentNetwork.lastCheckedBlock })
    // .on('data', (event) => setArray(event))

  async function setArray(event) {
    console.log(event);
    var fullProtocolList = await Payment.findById(protocol)
    var amountEthSent = web3.utils.fromWei(event.returnValues.amount, 'ether')

    var user = await User.findById(event.returnValues.user.toLowerCase())
    console.log(user)
    var subscriptionLength = await checkvalue(fullProtocolList, amountEthSent)
    console.log(subscriptionLength)
    
    var defaultAddress = "0x0bBD3a3d952fddf9A8811bC650445B7515a4B9e6"; //change for production
    if (event.returnValues.referrer != defaultAddress) {
      var referralUser = await User.findById(event.returnValues.referrer.toLowerCase())
      if (referralUser != null) {
        referralUser.subscriptionInfo.referralValue = referralUser.subscriptionInfo.referralValue +(event.returnValues.amount*(10**-18)*fullProtocolList.dollarValue*.2)
        referralUser.save()
      }
      else {
        const newuser = new User({
          _id: event.returnValues.referrer.toLowerCase(),
          wallet: [event.returnValues.referrer.toLowerCase()],
          subscriptionInfo: {
            duration: 0,
            joinDate: '',
            referralValue: (event.returnValues.amount*(10**-18)*fullProtocolList.dollarValue*.2),
          },
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
        })
        newuser.save()
      }

    }

    //updates last block number

    
    //if user doesn't exist in db
    if (user != null) {
      if (subscriptionLength != false) {
        if (user.subscriptionInfo.expirationDate) {
            if (DateTime.now().ts > DateTime.fromJSDate(user.subscriptionInfo.expirationDate).ts) {
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
          _id: event.returnValues.user.toLowerCase(),
          wallet: [event.returnValues.user.toLowerCase()],
          subscriptionInfo: {
            status: true,
            duration: subscriptionLength,
            payDate: DateTime.now().toISO,
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


