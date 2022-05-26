const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema({
    icon: String,
    name: String,
    website: String,
    totalClaimed: Number,
    contractAddress: String,
    protocolAbi: String,
    Claimable: Boolean,
    EstimatedClaimDate: String,
    updatedAt: Date
})

module.exports = mongoose.model("Protocol", protocolSchema)