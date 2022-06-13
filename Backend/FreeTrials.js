const mongoose = require("mongoose");
const crypto = require('crypto');
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const Trial = require("./Trial");

mongoose.connect('mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority');
var db = mongoose.connection;

codes = ["abc", "abc123", "ab12"]

// creating hashes of array, codes. pushing to database 
async function hashTrials(codes) {
    codes.forEach(element => {
        const encoded = crypto.createHash(element);
        const encodedCodes = new Trial ({
            code: encoded,
            claimable: True
        })
        await encodedCodes.save()
    });

}

//takes in user input of a code and checks if it is redeamable, updates db if code is claimable
// returns true if code is valid and false if not
async function checkCode(code) {
    const toCheck = crypto.createHash(code);
    const match = await Trial.exist({ code: toCheck, claimable: true})
    if (match) {
        const toUpdate = await Trial.findOne({ code: toCheck, claimable: true})
        toUpdate.claimable = false;
        await toUpdate.save()
    }
    return match;
}

