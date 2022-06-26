const mongoose = require("mongoose");

const paymentNetworksSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    lastCheckedBlock: Number,
    updatedAt: Date

})

module.exports = mongoose.model("PaymentNetwork", paymentNetworksSchema)

