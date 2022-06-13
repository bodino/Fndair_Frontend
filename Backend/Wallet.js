const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    _id: String,
    totClaimedValue: Number,
    data: [{
        protocol: String, 
        tokAvail: Number,
        claimed: Boolean
    }]
})

module.exports = mongoose.model("Wallet", walletSchema)