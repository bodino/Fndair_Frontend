//import { validate } from "./Wallet";

const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const User = require("./User");
const Wallet = require("./Wallet");
const Data = require("./Data");
const Protocol = require("./Protocol")
const hop = require('./Data/Hop.json');
const uniswap = require('./Data/Uniswap.json');
const paraswap = require('./Data/Paraswap.json');
const dydx = require('./Data/Dydx.json');
const optimism = require('./Data/Optimism.json');
const eul = require('./Data/EUL.json');



const CoinGecko = require('coingecko-api');
const e = require("express");

const api = new CoinGecko();
mongoose.connect('mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

//converts price from usd to eth
//takes in amount in usd as parameter
async function getPriceEth(amount) {
    const ethApi = require("etherscan-api").init('4VKSZCCA1HS85KGVK7EAVJEYB32218HJ1Y')
    var eth = await ethApi.stats.ethprice();
    const ethUsd = eth.result.ethusd;
    return ((1 / ethUsd) * amount)
}

//get twitter url
//takes in protocol name
async function getTwitterUrl(name) {
    const protocol = await Protocol.find({name: name}, err => {
        if (err) {
            console.log(err);
        } else {
            console.log("searching for matching wallet")
        }
    })
    return protocol.twitter
}

//creates new user and checks if payment has been made at point of sign up
function newUser(email, address, paid, duration) {
    const user = new User({
        _id: String,
        email: email,
        wallet: [address],
        subscriptionInfo: {
            duration: duration,
            payDate: null,
            expirationDate: null
        },
        updatedAt: new Date.now()
    })
    if (paid === true) {
        user.userPaid(duration);
    }
}

function newData(protocolAddress, numTok) {
    const data  = new Data({
        protocolAddress: protocolAddress,
        tokAvail: numTok,
    })
    return data
}

//NEEDS RETHINKING
// function takes in protocol name, wallet address and num tokens to allocate
// adds to data field in wallet if wallet exits, if wallet does not exist creates new wallet and adds field
  async function addData(claimAddress, address, tokenNum) {
    //check if address is in db
    address = address.toLowerCase()
    console.log(address)
    const wallet = await Wallet.findById(address).exec();
    const data = newData(claimAddress, tokenNum);
    if (wallet === null) {
        const newWallet = new Wallet({
            _id: address,
            toClaim: [data],
            updatedAt: new Date()
        })
        newWallet.save((err) => {
            if (err) {
                console.log(err);
            }
        });
    } else {
        wallet.toClaim.push(data);
        wallet.updatedAt = new Date();
        wallet.save(err => {
            if (err) {
                console.log(err)
            }
        })
    }
}




//take in address of wallet and protocol name and updates data field in wallet if a transfer has been made
//updates totvalue claimed in the wallet too
async function updateTokenClaim(protocolAdd, WalletAdd, val) {
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
            wallet.updateClaim(targetProtocol.name);
        }
    });
}


// needs reworking
async function newProtocol(address) {
    const protocol = await new Protocol({
        _id: address,
        claimAddress: result.data.contract_address,
        gekoId: result.data.id,
        icon: result.data.image.large,
        name: result.data.name,
        website: result.data.links.homepage[0],
        twitter: String,
        priceUsd: result.data.market_data.current_price.usd,
        totalSupply: result.data.market_data.total_supply,
        Claimable: Boolean,
        EstimatedClaimDate: String,
        updatedAt: new Date()
    })

    protocol.save(err => {
        if (err) {
            console.log(err);
        } else {
            console.log("protocol added")
        }
    });
}

// take in data in create documents
async function populateDatabase(data) {
    await basicnewProtocol(data.Info);
    const claimAddress = data.Info.claimAddress;
    const tokenData = data.Data;
    const wallets = await Wallet.find()
    for (var token in tokenData) {
    await addData(claimAddress, token, tokenData[token].tokens);
    }
    console.log("update succcessful")
}


async function basicnewProtocol(info) {
    const protocol = new Protocol({
        _id: info.claimAddress,
        claimAddress: info.claimAddress,
        tokenDistributorAddress: info.tokenDistributorAddress,
        gekoId: info.gekoId,
        icon: info.icon,
        name: info.name,
        website: info.website,
        twitter: info.twitter,
        priceUsd: info.priceUsd,
        totalSupply: info.totalSupply,
        Claimable: info.Claimable,
        EstimatedClaimDate: info.EstimatedClaimDate,
        updatedAt: new Date()
    })

    protocol.save(err => {
        if (err) {
            console.log(err);
        } else {
            console.log("protocol added")
        }
    });
}

// populateDatabase(hop);


//new and inproved adddata function
async function newaddData(tokenData, claimAddress) {
    console.log("finding")
    const wallets = await Wallet.find()
    console.log("found")
    var x = 0;
    // console.log(tokenData[wallets[0]._id])
    for (var i = 0; i < wallets.length; i++) {
        if (tokenData[wallets[i]._id] !== undefined) {
            console.log(x++)
            const data = newData(claimAddress, tokenData[wallets[i]._id].tokens);
           
            const newWallet = new Wallet(wallets[i])
            newWallet.toClaim.push(data);
                newWallet.updatedAt = new Date();
                newWallet.save(err => {
                    if (err) {
                        console.log(err)
                    }
                }) 
        delete tokenData[wallets[i]._id];
        }    
    }
    console.log("finished first step")
    // address = token.toLowerCase()
    x=0;
    var index =0; 
    var pusharray = []
    for (var token in tokenData) {
        console.log(x++)
        const data = newData(claimAddress, tokenData[token].tokens);
        const newWallet = await new Wallet({
                    _id: token,
                    toClaim: [data],
                    updatedAt: new Date()
                })
                // await newWallet.save((err) => {
                //     if (err) {
                //         console.log(err);
                //     }
                // });
        pusharray.push(newWallet); 
        index++;
        }
        await Wallet.insertMany(pusharray)
        console.log("update succcessful")
}

async function newpopulateDatabase(data) {
    await basicnewProtocol(data.Info);
    const claimAddress = data.Info.claimAddress;
    const tokenData = data.Data;
    await newaddData(tokenData, claimAddress)
  

}

newpopulateDatabase(uniswap)