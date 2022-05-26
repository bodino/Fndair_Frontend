const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    protocol: String, 
    tokAvail: Number
})

const walletSchema = new mongoose.Schema({
    _id: String,
    data: [{
        protocol: String, 
        tokAvail: Number
    }]
})

module.exports = mongoose.model("Wallet", walletSchema)