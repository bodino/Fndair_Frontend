const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id: String,
    email: {
        type:String,
        required: false,
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
        duration: {
            type: Number,
            default: 0
        },
        payDate: Date,
        expirationDate: Date
    },
    updatedAt: Date
})

//date is in milliseconds since 1970, coverts it to readable string
function getExpirationDate(length) {
    var date = new Date();
    var dd = String(date.getDate() + length).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0
    var yyyy = date.getFullYear(); 
    return mm + '/' + dd + '/' + yyyy;
}

userSchema.methods.userPaid = function(length) {
    this.subscriptionInfo.status = true;
    this.subscriptionInfo.payDate = Date.now();
    this.subscriptionInfo.duration = length;
    this.subscriptionInfo.expirationDate = getExpirationDate(this.subscriptionInfo.payDate, length);
    this.updatedAt = Date.now()
    this.save();
    console.log("user subscription registered, expires on " + this.subscriptionInfo.expirationDate)
}

module.exports = mongoose.model("User", userSchema)