const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    protocol: String, 
    tokAvail: Number
})

module.exports = mongoose.model("Data", dataSchema)