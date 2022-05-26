const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const User = require("./User");
const Wallet = require("./Wallet");
const Data = require("./Data");
const Protocol = require("./Protocol")

mongoose.connect('mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

//protocol should take in a dic and take data from there
// function newProtocol() {
//     const protocol = Protocol({
//         icon: "Path/To/Image",
//         name: "Hop",
//         website: "https://app.hop.exchange/#/airdrop/preview",
//         totalClaimed: 0,
//         contractAddress: "asbdb123",
//         protocolAbi: "thisWillBeAnABI",
//         Claimable: false,
//         EstimatedClaimDate: "Q2",
//         updatedAt: Date.now(),
//     })
//     return protocol; 
// }
// const protocol = newProtocol();
// protocol.save()

// function newData() {
//     const data  = new Data({
//         protocol: "Hop",
//         tokAvail: 123
//     })
//     return data
// }


// function should take in a wallet address and data schema to add
function updateWallet(addy, data) {
    const wallet = Wallet.findById("abcd")
    if (wallet.length === undefined) {
        const data = new Data({
            protocol: "Hop",
            tokAvail: 123
        })
        const wallet = Wallet({
            _id: "abc",
            data: [data]
        })
        wallet.save()
    } else {
        const data = new Data({
            protocol: "Hop",
            tokAvail: 123
        })
        Wallet.updateOne({_id: "abc"}, { $push: {data: data}} )
    }
}
updateWallet();

