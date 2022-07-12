const mongoose = require("mongoose");


const graphDataSchema = new mongoose.Schema({
    dates: Array, 
    prices: Array,
})

module.exports = mongoose.model("GraphData", graphDataSchema)