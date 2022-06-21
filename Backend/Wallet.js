const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    _id: String,
    totClaimedValue: Number,
    toClaim: [{
        protocol: String, 
        tokAvail: Number,
        valueUsd: Number
    }],
    claimed: [{
        protocol: String, 
        tokAvail: Number,
        valueUsd: Number
    }]
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
