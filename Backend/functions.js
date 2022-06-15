//import { validate } from "./Wallet";

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


function newData(name, numTok) {
    const data  = new Data({
        protocol: name,
        tokAvail: numTok,
        claimed: false
    })
    return data
}

// function takes in protocol name, wallet address and num tokens to allocate
// adds to data field in wallet if wallet exits, if wallet does not exist creates new wallet and adds field
async function addData(name, address, tokenNum) {
    //check if address is in db
    const checkAddress = await Wallet.findById(address).exec();
    const data = newData(name, tokenNum);
    if (checkAddress === null) {
        const wallet = new Wallet({
            _id: address,
            data: [data],
            claimed: false
        })
        wallet.save((err) => {
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
    // add wallet to protocol
    const protcol = await Protocol.findOneAndUpdate({name: name}, {$push: {wallets: address}}, function (err, succ) {
        if (err) {
            console.log(err);
        } else {
            console.log(succ);
        }
    })
}


//take in address of wallet and protocol name and updates data field in wallet if a transfer has been made
//updates totvalue claimed in the wallet too
async function updateClaim(protocolAdd, WalletAdd, val) {
    var change = true;
    if (val <= 0) {
        change = false;
        console.log("value is 0");
    }
    const targetProtocol = await Protocol.find({address: protocolAdd}, err => {
        if (err) {
            console.log(err);
        } else {
            console.log("searching for matching wallet")
        }
    })
    targetProtocol.wallets.forEach((element) => {
        if (element === WalletAdd) {
            const wallet = Wallet.findById(element).exec();
            wallet.data.claimed = true;
            //update token monetary value
            wallet.data.valueUsd = 9999;
            wallet.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("wallet claim updated")
                }
            });
       }
    });
}


// protocol takes in a dict or file and take data from there
async function newProtocol(desc) {
    const protocol = await new Protocol({
        icon: desc['icon'],
        name: desc['name'],
        website: desc['website'],
        twitter: desc['twitter'],
        totalClaimed: parseInt(desc['totalClaimed']),
        contractAddress: desc['contractAddress'],
        protocolAbi: desc['protocolAbi'],
        Claimable: (desc['Claimable'] == "true"),
        EstimatedClaimDate: desc['EstimatedClaimDate'],
        updatedAt: Date.now()
    })

    protocol.save();
}

// take in data in create documents
async function populateDatabase(data) {
    newProtocol(data.Info);
    const name = data.Info.name;
    const tokenData = data.Data;
    for (var token in tokenData) {
        updateWallet(name, token, tokenData[token].tokens);
    }
    console.log("update succcessful")
}
