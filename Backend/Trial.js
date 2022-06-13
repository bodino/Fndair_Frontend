const mongoose = require("mongoose");

const trialCodeSchema = new mongoose.Schema({
    code: String,
    claimable: Boolean
})

module.exports = mongoose.model("TrialCode", trialCodeSchema)