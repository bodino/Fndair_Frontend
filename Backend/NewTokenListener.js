const Web3 = require('web3')
const TokenArtifact = require('../USDC.json')
const mongoose = require('mongoose')
const { DateTime } = require('luxon')
const { MongoClient, ServerApiVersion } = require('mongodb')
const uri =
  'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri)
const Payment = require('../Backend/Payment.js')
const User = require('../Backend/User.js')
const PaymentNetwork = require('../Backend/PaymentNetwork.js')
const Protocol = require('../Backend/Protocol.js')
const Wallet = require("./Wallet");
var erc20Abi = [{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "name": "from",
            "type": "address"
        },
        {
            "indexed": true,
            "name": "to",
            "type": "address"
        },
        {
            "indexed": false,
            "name": "value",
            "type": "uint256"
        }
    ],
    "name": "Transfer",
    "type": "event"
}]


var transactionObject = {};
async function findClaims(fullProtocol) {
    const web3 = new Web3(fullProtocol.rpc)
    const contract = new web3.eth.Contract(erc20Abi, fullProtocol.claimAddress)
    var atBlock = fullProtocol.atBlock;
    var increment = 128000;
                    
        // var increment = 500;


    search(atBlock,atBlock+increment,contract,increment,fullProtocol)

   

 async function search(atBlock,atBlockPlusIncrement,contract,increment,fullProtocol){
    console.log(fullProtocol.name)
    await contract.getPastEvents('Transfer', { fromBlock: atBlock, toBlock: atBlockPlusIncrement, filter: {from: fullProtocol.tokenDistributorAddress} }, function(error, events){ })
    .then(async function(events){
   
    // console.log(atBlockPlusIncrement)
  

    if (events.length >= 1  ){
        for (var i =0; i < events.length; i++){
            if (events[i].blockNumber > atBlock) {
                console.log(events[i].returnValues.to)
                if (transactionObject[events[i].returnValues.to.toLowerCase()]==undefined){
                     transactionObject[events[i].returnValues.to.toLowerCase()] = [fullProtocol.claimAddress];
                } else {
                    transactionObject[events[i].returnValues.to.toLowerCase()].push(fullProtocol.claimAddress);
                }
            }
        }
    }
        // console.log("WAAYAYAYA")
    await Protocol.findByIdAndUpdate(fullProtocol._id, {atBlock: atBlockPlusIncrement - 129000})
    setTimeout(function () {
        search(atBlock+increment,atBlockPlusIncrement+increment,contract,increment,fullProtocol)
      }, 1000)
      
  }).catch(function(err){
    if (err.toString().slice(0, -21) == "Error: Returned error: Log response size exceeded. You can make eth_getLogs requests with up to a 2K block range and no limit on the response size, or you can request any block range with a cap of 10K logs in the response. Based on your parameters and the response size limit, this block range should work:"){
    console.log("yes they are equal")
    console.log(increment)
    setTimeout(function () {
    search(atBlock,atBlockPlusIncrement-Math.round(increment/2),contract, Math.round(increment/2),fullProtocol)
    }, 1000)
    } else if (err.toString() == "Error: Returned error: Query timeout exceeded. Consider reducing your block range."){
        console.log("new eroror")
        setTimeout(function () {
        search(atBlock,atBlockPlusIncrement-Math.round(increment/2),contract, Math.round(increment/2),fullProtocol)
         }, 1000)
    }
    else if (increment < 1000 && err.toString() == "Error: Returned error: One of the blocks specified in filter (fromBlock, toBlock or blockHash) cannot be found.") {
        // console.log("checkinglatest")
        console.log(err)
        console.log(increment)
        setTimeout(function () {
        checkLatest(atBlock,contract,fullProtocol)
        }, 1000) 
    } else {
        setTimeout(function () {
            search(atBlock,atBlockPlusIncrement-Math.round(increment/2),contract, Math.round(increment/2),fullProtocol)
            }, 1000)    }
  })
 }

 async function checkLatest(atBlock,contract,fullProtocol){
    console.log(atBlock)
    await contract.getPastEvents('Transfer', { fromBlock: atBlock, filter: {from: fullProtocol.tokenDistributorAddress} }, function(error, events){ })
    .then(async function(events){

    if (events.length >= 1  ){
    for (var i =0; i < events.length; i++){
        if (events[i].blockNumber > atBlock) {
            console.log(events[i].returnValues.to)
            if (transactionObject[events[i].returnValues.to.toLowerCase()]==undefined){
                transactionObject[events[i].returnValues.to.toLowerCase()] = [fullProtocol.claimAddress];
           } else {
               transactionObject[events[i].returnValues.to.toLowerCase()].push(fullProtocol.claimAddress);
           }       
         }
    }
     atBlock = events[events.length-1].blockNumber
    }
    
    console.log("Protocol "+fullProtocol.name+ " is up to date")
    await Protocol.findByIdAndUpdate(fullProtocol._id, {atBlock: atBlock - 129000})
    setTimeout(function () {
        checkLatest(atBlock,contract,fullProtocol)
      }, 30000)
     
       
  }).catch(async function(err){
    // console.log("checkinglatest")
    console.log(err.toString())
    if (err.toString() == "Error: Returned error: One of the blocks specified in filter (fromBlock, toBlock or blockHash) cannot be found."){
        // console.log("in the endgamenow")
        // console.log(atBlock)
        latestblock = await web3.eth.getBlockNumber()
        await Protocol.findByIdAndUpdate(fullProtocol._id, {atBlock: latestblock -129000})
        // console.log(latestblock)
        setTimeout(function () {
            checkLatest(latestblock,contract,fullProtocol)
          }, 30000)
    } else {
  
    setTimeout(function () {
        checkLatest(atBlock,contract,fullProtocol)
      }, 30000)
    }
  })
 }
}


    async function keepAllProtocolsUpToDate(){
            // var fullProtocol = await Protocol.find()
            var fullProtocol = await Protocol.find()
            findClaims(fullProtocol[0])
            findClaims(fullProtocol[1])
            findClaims(fullProtocol[2])
            findClaims(fullProtocol[3])
            findClaims(fullProtocol[4])
            findClaims(fullProtocol[5])
            uploadBundler()
            // for (var i = 0; i < fullProtocol.length; i++) {
            //     findClaims(fullProtocol[i])
            // }   
      
    }


    async function uploadBundler(){
        //list of 
        console.log("hello")
        var bundle = transactionObject
        transactionObject = {};
        var array = []
        var x = 0;
        for (var key in bundle) {
            if (bundle.hasOwnProperty(key)) {
                x++
                array[x] = key
            }
        }

        let wallets = await Wallet.find(
            {'_id': { $in: array}}
          );
          console.log("hello1.5")

        for (var j = 0; j < wallets.length; j++) {
            if (bundle[wallets[j]._id]){
                console.log("hello2")

                console.log(bundle[wallets[j]._id])
                for (var l = 0; l < wallets[j].toClaim.length; l++) {
                    console.log("hello3")

                    for (var k = 0; k < bundle[wallets[j]._id].length; k++) {
                        if (wallets[j].toClaim[l]?.protocolAddress == bundle[wallets[j]._id][k]){
                               wallets[j].claimed.push(wallets[j].toClaim[l]);
                               wallets[j].toClaim.splice(l, 1);   
                               console.log("working"); 
                               console.log( wallets[j]._id)

                        }
                    }
                                    
                }
            }

        const newWallet = new Wallet(wallets[j])
        newWallet.updatedAt = new Date();
        await newWallet.save(err => {
            if (err) {
                console.log(err)
            }
        }) 
        console.log(j/wallets.length *100+ " percent complete")
        } 

        setTimeout(function () {
            uploadBundler()
          }, 10000)
    }


    module.exports = { keepAllProtocolsUpToDate }