const express = require('express');
const Wallet = require('../Backend/Wallet.js')
const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb')

const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection

router.get('/:Address', async function (req, res) {
  await Wallet.findById(req.params.Address, function (err, result) {
    if (result) {
      res.json(result)
    } else {
      res.json('No Address Found')
    }
  })
})

module.exports = router