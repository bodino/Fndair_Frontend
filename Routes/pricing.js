const express = require('express');
const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb')

const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection
const Payment = require('../Backend/Payment.js')

const ethApi = require("etherscan-api").init('4VKSZCCA1HS85KGVK7EAVJEYB32218HJ1Y')

//converts price from usd to eth
//takes in amount in usd as parameter
async function getPriceEth(amount) {
    var eth = await ethApi.stats.ethprice();
    const ethUsd = eth.result.ethusd;
    return ((1 / ethUsd) * amount)
}

router.get('', async (req, res) => {
    var fullProtocolList = await Payment.find()
    res.json(fullProtocolList);
})

module.exports = router
