const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    _id: String,
    totClaimedValue: Number,
    toClaim: [{
        protocolAddress: String, 
        tokAvail: Number,
    }],
    claimed: [{
        protocolAddress: String, 
        tokAvail: Number,
    }],
    updatedAt: Date
})

walletSchema.methods.updateClaim = function(protocolName, usd) {
    this.toClaim.forEach((proto, index) => {
        if (proto.protocol === protocolName) {
            proto.valueUsd = usd;
            claimed.push(proto);
            toClaim.splice(index, 1);
        }
    })
    this.save();
}

module.exports = mongoose.model("Wallet", walletSchema)
