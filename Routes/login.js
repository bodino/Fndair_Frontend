const express = require('express')
const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb')
const User = require('../Backend/User.js')
const Wallet = require('../Backend/Wallet.js')
const Web3 = require('web3')
const Protocol = require('../Backend/Protocol.js')
const { DateTime } = require('luxon')

const web3 = new Web3(
  'wss://ropsten.infura.io/ws/v3/d825deabe0454bbe8223e500dd8dd785',
)

const router = express.Router()
const uri =
  'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri)
var db = mongoose.connection

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next()
  } else {
    res.status(401).send('Unauthorized')
  }
}

router.get('', isAuth, async function (req, res) {
  var addresses
  User.findById(req.session.address).then((result) => {
    console.log(result)
    addresses = result.wallet
  })
  var protocolList = await Protocol.find()
  User.findById(req.session.address)
    .populate('wallet')
    .then(async (result) => {
      result = result.toObject()
      result.followedAddresses = addresses
      result.protocols = protocolList

      console.log(result)
      for (var i = 0; i < result.wallet.length; i++) {
        for (var j = 0; j < result.wallet[i].toClaim.length; j++) {
          var fullProtocolinfo = await Protocol.findById(result.wallet[i].toClaim[j].protocolAddress)
          console.log(fullProtocolinfo);
          var protocolInfo = fullProtocolinfo.toObject()
          result.wallet[i].toClaim[j].valueUsd =
            protocolInfo.priceUsd * result.wallet[i].toClaim[j].tokAvail
          if (!result.subscriptionInfo.status) {
            result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
          } else {
            if (
              DateTime.now().toJSDate().getTime() >
                result.subscriptionInfo.expirationDate?.getTime() ||
              !result.subscriptionInfo.expirationDate
            ) {
              result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
              await User.findByIdAndUpdate(address, {
                subscriptionInfo: { status: false },
              })
            } else {
              result.wallet[i].toClaim[j].info = protocolInfo
            }
          }
        }
        for (var j = 0; j < result.wallet[i].claimed.length; j++) {
          var fullProtocolinfo = await Protocol.findById(result.wallet[i].claimed[j].protocolAddress)
          var protocolInfo = fullProtocolinfo.toObject()
          result.wallet[i].claimed[j].valueUsd =
            protocolInfo.priceUsd * result.wallet[i].claimed[j].tokAvail
          if (!result.subscriptionInfo.status) {
            result.wallet[i].claimed[j].protocolAddress = 'Hidden'
          } else {
            if (
              DateTime.now().toJSDate().getTime() >
                result.subscriptionInfo.expirationDate?.getTime() ||
              !result.subscriptionInfo.expirationDate
            ) {
              result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
              await User.findByIdAndUpdate(address, {
                subscriptionInfo: { status: false },
              })
            } else {
              result.wallet[i].claimed[j].info = protocolInfo
            }
          }
        }
      }
      result.loggedin = true
      res.json(result)
    })
})

router.post('', async function (req, res) {
  const body = req.body
  console.log(body)
  message = body.UserInfo.message
  signature = body.UserInfo.signature
  address = body.UserInfo.address
  var generatedaddress = web3.eth.accounts.recover(message, signature)
  // console.log(food);
  if (address === generatedaddress) {
    address = address.toLowerCase()
    var protocolList = await Protocol.find()
    User.findById(address).then((result) => {
      console.log(result)
      if (result) {
        console.log('3')
        req.session.isAuth = 'true'
        req.session.address = address
        var addresses
        addresses = result.wallet

        User.findById(req.session.address)
          .populate('wallet')
          .then(async (result) => {
            result = result.toObject()
            result.followedAddresses = addresses

            console.log(result)
            for (var i = 0; i < result.wallet.length; i++) {
              for (var j = 0; j < result.wallet[i].toClaim.length; j++) {
                var fullProtocolinfo = await Protocol.findById(result.wallet[i].toClaim[j].protocolAddress)
                var protocolInfo = fullProtocolinfo.toObject()
                result.wallet[i].toClaim[j].valueUsd =
                  protocolInfo.priceUsd * result.wallet[i].toClaim[j].tokAvail
                if (!result.subscriptionInfo.status) {
                  result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
                } else {
                  if (
                    DateTime.now().toJSDate().getTime() >
                      result.subscriptionInfo.expirationDate?.getTime() ||
                    !result.subscriptionInfo.expirationDate
                  ) {
                    result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
                    await User.findByIdAndUpdate(address, {
                      subscriptionInfo: { status: false },
                    })
                  } else {
                    result.wallet[i].toClaim[j].info = protocolInfo
                  }
                }
              }
              for (var j = 0; j < result.wallet[i].claimed.length; j++) {
                var fullProtocolinfo = await Protocol.findById(result.wallet[i].claimed[j].protocolAddress)
                var protocolInfo = fullProtocolinfo.toObject()
                result.wallet[i].claimed[j].valueUsd =
                  protocolInfo.priceUsd * result.wallet[i].claimed[j].tokAvail
                if (!result.subscriptionInfo.status) {
                  result.wallet[i].claimed[j].protocolAddress = 'Hidden'
                } else {
                  if (
                    DateTime.now().toJSDate().getTime() >
                      result.subscriptionInfo.expirationDate?.getTime() ||
                    !result.subscriptionInfo.expirationDate
                  ) {
                    result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
                    await User.findByIdAndUpdate(address, {
                      subscriptionInfo: { status: false },
                    })
                  } else {
                    result.wallet[i].claimed[j].info = protocolInfo
                  }
                }
              }
            }
            result.protocols = protocolList
            result.loggedin = true
            res.json(result)
          })
      } else {
        console.log('4')
        const user = new User({
          _id: address,
          wallet: [address],
          subscriptionInfo: {
            duration: 0,
            joinDate: '',
            referralValue: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        user.save(function (err, user) {
          if (err) {
            console.log(err)
          } else {
            req.session.isAuth = true
            req.session.address = address
            User.findById(address).then((result) => {
              console.log(result)
              if (result) {
                console.log('3')
                req.session.isAuth = 'true'
                req.session.address = address
                var addresses
                addresses = result.wallet

                User.findById(req.session.address)
                  .populate('wallet')
                  .then(async (result) => {
                    result = result.toObject()
                    result.followedAddresses = addresses

                    console.log(result)
                    for (var i = 0; i < result.wallet.length; i++) {
                      for (var j = 0; j < result.wallet[i].toClaim.length; j++) {
                        var fullProtocolinfo = await Protocol.findById(result.wallet[i].toClaim[j].protocolAddress)
                        var protocolInfo = fullProtocolinfo.toObject()
                        result.wallet[i].toClaim[j].valueUsd =
                          protocolInfo.priceUsd *
                          result.wallet[i].toClaim[j].tokAvail
                        if (!result.subscriptionInfo.status) {
                          result.wallet[i].toClaim[j].protocolAddress = 'Hidden'       
                        } else {
                          if (
                            DateTime.now().toJSDate().getTime() >
                              result.subscriptionInfo.expirationDate?.getTime() ||
                            !result.subscriptionInfo.expirationDate
                          ) {
                            result.wallet[i].toClaim[j].protocolAddress =
                              'Hidden'
                            await User.findByIdAndUpdate(address, {
                              subscriptionInfo: { status: false },
                            })
                          } else {
                            result.wallet[i].toClaim[j].info = protocolInfo
                          }
                        }
                      }
                      for (var j = 0; j < result.wallet[i].claimed.length; j++) {
                        var fullProtocolinfo = await Protocol.findById(result.wallet[i].claimed[j].protocolAddress)
                        var protocolInfo = fullProtocolinfo.toObject()
                        result.wallet[i].claimed[j].valueUsd =
                          protocolInfo.priceUsd * result.wallet[i].claimed[j].tokAvail
                        if (!result.subscriptionInfo.status) {
                          result.wallet[i].claimed[j].protocolAddress = 'Hidden'
                        } else {
                          if (
                            DateTime.now().toJSDate().getTime() >
                              result.subscriptionInfo.expirationDate?.getTime() ||
                            !result.subscriptionInfo.expirationDate
                          ) {
                            result.wallet[i].toClaim[j].protocolAddress = 'Hidden'
                            await User.findByIdAndUpdate(address, {
                              subscriptionInfo: { status: false },
                            })
                          } else {
                            result.wallet[i].claimed[j].info = protocolInfo
                          }
                        }
                      }
                    }
                    result.protocols = protocolList
                    result.loggedin = true
                    res.json(result)
                  })
              }
            })
          }
        })
      }
    })
  }
})

module.exports = router
