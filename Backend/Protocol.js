const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    claimAddress: String,
    gekoId: String,
    icon: String,
    name: String,
    website: String,
    twitter: String,
    priceUsd: Number,
    totalSupply: Number,
    Claimable: Boolean,
    EstimatedClaimDate: String,
    updatedAt: Date
})

module.exports = mongoose.model("Protocol", protocolSchema)