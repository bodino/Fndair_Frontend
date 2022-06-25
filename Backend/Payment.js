const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    geckoId: String,
    lastCheckedBlock: Number,
    amount1Month: Number,
    amount6Month: Number,
    amount12Month: Number,
    updatedAt: Date

})

module.exports = mongoose.model("Payment", paymentSchema)

