const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    protocol: String, 
    tokAvail: Number,
    claimed: Boolean
})

module.exports = mongoose.model("Data", dataSchema)