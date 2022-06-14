const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema({
    wallets: [{ type: String, ref: 'Wallet' }],
    address: String,
    icon: String,
    name: String,
    website: String,
    twitter: String,
    totalClaimed: Number,
    contractAddress: String,
    Claimable: Boolean,
    EstimatedClaimDate: String,
    updatedAt: Date
})

module.exports = mongoose.model("Protocol", protocolSchema)