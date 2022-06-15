const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema({
    wallets: [{ type: String, ref: 'Wallet' }],
    contractAddress: {
        type: String,
        required: true
    },
    icon: String,
    name: String,
    website: String,
    twitter: String,
    totalClaimed: Number,
    Claimable: Boolean,
    EstimatedClaimDate: String,
    updatedAt: Date
})

module.exports = mongoose.model("Protocol", protocolSchema)