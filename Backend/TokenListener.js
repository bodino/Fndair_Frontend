const  Web3  = require("web3");
const CoinGecko = require('coingecko-api');
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const Wallet = require("./Wallet")
const Protocol = require("./Protocol")

const web3 = new Web3('wss://mainnet.infura.io/ws/v3/2f7b8a89dff14cd19a384dcf799f4ebd');
const api = new CoinGecko();

async function tokenUsdPrice(address, num) {
    const result = await api.coins.fetchCoinContractInfo(address);
    const priceUsd = result.data.market_data.current_price.usd * num;
    console.log(priceUsd);
    return priceUsd.toFixed(2);
}

async function updateTokenClaim(protocolAdd, WalletAdd, val) {
    if (val <= 0) {
        console.log("value is 0");
    } else {
        const valueUsd = tokenUsdPrice(protocolAdd, val) // val will need to be decreased in decimals
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
                wallet.updateClaim(targetProtocol.name, valueUsd);
            }
        });
    }
}

export async function setUpClaimMonitor(protocolAddress) {
    address = protocolAddress;
    erc20Abi = [{
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

    const contract = new web3.eth.Contract(erc20Abi, address)
    contract.events.Transfer({
                fromBlock: 'latest',
                filter: {from: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC"}
            })
            .on('data', event => {
                updateTokenClaim(event.returnValues.Result.from, event.returnValues.Result.to, event.returnValues.Result.value)
            })
            .on('error', err => {console.log(err)})
}