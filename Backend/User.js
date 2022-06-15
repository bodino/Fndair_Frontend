const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id: String,
    email: {
        type:String,
        required: true,
        lowercase: true
    },
    wallet: [{ type: String, ref: 'Wallet' }],
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    subscriptionInfo: {
        status : {
            type: Boolean,
            default: false
        },
        duration: Number,
        joinDate: Date,
    },
    updatedAt: Date
})

module.exports = mongoose.model("User", userSchema)