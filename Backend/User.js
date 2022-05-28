const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id: String,
    wallet: [String],
    createdAt: {
        type: Date,
        immutable: true
    },
    updatedAt: Date
})

module.exports = mongoose.model("User", userSchema)