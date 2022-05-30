const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const User = require("./User");
const Wallet = require("./Wallet");
const Data = require("./Data");
const Protocol = require("./Protocol")
const hop = require('./Data/Hop.json');

mongoose.connect('mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

// protocol takes in a dict or file and take data from there
async function newProtocol(desc) {
    const protocol = new Protocol({
        icon: desc['icon'],
        name: desc['name'],
        website: desc['website'],
        totalClaimed: parseInt(desc['totalClaimed']),
        contractAddress: desc['contractAddress'],
        protocolAbi: desc['protocolAbi'],
        Claimable: (desc['Claimable'] == "true"),
        EstimatedClaimDate: desc['EstimatedClaimDate'],
        updatedAt: Date.now()
    })

    await protocol.save();
}


function newData(name, numTok) {
    const data  = new Data({
        protocol: name,
        tokAvail: numTok
    })
    return data
}


// function takes in protocol name, wallet address and num tokens to allocate
async function updateWallet(name, address, tokenNum) {
    const checkAddress = await Wallet.findById(address).exec();
    const data = newData(name, tokenNum);
    if (checkAddress === null) {
        const wallet = new Wallet({
            _id: address,
            data: [data]
        })
        wallet.save(function(err, user) {
            if (err) {
                console.log(err);
            }
        });
    } else {
        Wallet.findOneAndUpdate({_id: address}, { $push: {data: data}}, function (err, succ) {
            if (err) {
                console.log(err);
            } else {
                console.log(succ);
            }
        } )
    }
}

// Wallet.findById("abc", function (err,result) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(result);
//     }
// })

// take in data in create documents
populateDatabase(hop);
async function populateDatabase(data) {
    newProtocol(data.Info);
    const name = data.Info.name;
    const tokenData = data.Data;
    for (var token in tokenData) {
        await updateWallet(name, token, tokenData[token].tokens);
    }
    console.log("update succcessful")
}

