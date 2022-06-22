const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb')
const User = require('../Backend/User.js')
const Wallet = require('../Backend/Wallet.js')
const Web3 = require('web3')
const web3 = new Web3(
    'wss://ropsten.infura.io/ws/v3/d825deabe0454bbe8223e500dd8dd785',
  )


const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
      next()
    } else {
      res.status(401).send('Unauthorized')
    }
  }

router.get('', isAuth, function (req, res) {
    var addresses
    User.findById(req.session.address).then((result) => {
      addresses = result.wallet
    })
    User.findById(req.session.address)
      .populate('wallet')
      .then((result) => {
        result.subscriptionInfo.status = 'addresses'
        result = result.toObject()
        result.followedAddresses = addresses
  
        console.log(result)
        if (!result.subscriptionInfo.status) {
          for (var i = 0; i < result.wallet.length; i++) {
            for (var j = 0; j < result.wallet[i].data.length; j++) {
              result.wallet[i].data[j].protocol = 'Hidden'
            }
          }
          result.loggedin = true
          res.json(result)
        } else {
          result.loggedin = true
          res.json(result)
        }
      })
  })
  
  
  router.post('', function (req, res) {
    const body = req.body
    console.log(body)
    message = body.UserInfo.message
    signature = body.UserInfo.signature
    address = body.UserInfo.address
    var generatedaddress = web3.eth.accounts.recover(message, signature)
    // console.log(food);
    if (address === generatedaddress) {
      console.log('1')
      User.findById(address)
        .then((result) => {
          console.log(result)
          if (result) {
            console.log('3')
            req.session.isAuth = 'true'
            req.session.address = address
            var addresses
            addresses = result.wallet
          
            User.findById(req.session.address)
              .populate('wallet')
              .then((result) => {
                result.subscriptionInfo.status = 'addresses'
                result = result.toObject()
                result.followedAddresses = addresses
  
                console.log(result)
                if (!result.subscriptionInfo.status) {
                  for (var i = 0; i < result.wallet.length; i++) {
                    for (var j = 0; j < result.wallet[i].data.length; j++) {
                      result.wallet[i].data[j].protocol = 'Hidden'
                    }
                  }
                  result.loggedin = true
                  res.json(result)
                } else {
                  result.loggedin = true
                  res.json(result)
                }
              })
          } else {
            console.log('4')
            const user = new User({
              _id: address,
              wallet: [address],
              subscriptionInfo: {
                duration: 0,
                joinDate: '',
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
                
                res.json(user.toObject());
                
              }
            })
          }
        })
    }
  })
  

  module.exports = router

  
  