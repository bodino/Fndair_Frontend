const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb')
const User = require('../Backend/User.js')
const Wallet = require('../Backend/Wallet.js')

const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection

  router.get('', function (req, res) {
    req.session.destroy()
    res.json({ loggedin: false })
  })

  module.exports = router

  
  