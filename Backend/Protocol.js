const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    claimAddress: String,
    tokenDistributorAddress: String,
    gekoId: String,
    atBlock: Number,
    icon: String,
    name: String,
    desc: String,
    website: String,
    twitter: String,
    priceUsd: Number,
    totalSupply: Number,
    Claimable: Boolean,
    graphData: {
        dates: Array, 
        prices: Array,
    },
    EstimatedClaimDate: String,
    updatedAt: Date,
    rpc: String,
})

module.exports = mongoose.model("Protocol", protocolSchema)

