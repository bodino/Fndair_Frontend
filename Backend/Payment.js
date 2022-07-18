const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    geckoId: String,
    amount1Month: Number,
    amount6Month: Number,
    amount12Month: Number,
    dollarValue: Number,
    updatedAt: Date

})

module.exports = mongoose.model("Payment", paymentSchema)

