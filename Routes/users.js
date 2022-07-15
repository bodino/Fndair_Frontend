const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb')
const User = require('../Backend/User.js')
const Wallet = require('../Backend/Wallet.js')

const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection

//adding new wallet to user
router.put('/:id/:walletId', async (req, res) => {

    async function addwallet(userAddress, newAddress) {
        await User.findByIdAndUpdate(userAddress,
            {
                $addToSet: {
                    wallet: newAddress
                }
            }   
            )
        }  
    const user = await User.findById(req.params.id.toLowerCase()).exec();
    if (user.wallet.length >= 10) {
        res.status(500).json({message: 'There are too many wallets associated with this account, please delete one.'})
    } else { 
        addwallet(req.session.address, req.params.walletId.toLowerCase());
        res.json("done")
    }
})

//deleting wallet associated with user
router.delete('/:id/:walletId', async (req, res) => {
    async function removeWallet(userAddress, newAddress) {
        await User.findByIdAndUpdate(userAddress,
            {
                $pull: {
                    wallet: newAddress
                }
            }   
            )
        }  
    if (req.session.address != req.params.walletId){
        removeWallet(req.session.address, req.params.walletId.toLowerCase());
        res.json("done")
    } else {
        res.status(500).json({message: "Can't remove default wallet"})

}
})

module.exports = router