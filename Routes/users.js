const express = require('express');
const router = require('Router()')
const Wallet = require('./Backend/Wallet.js.js')
const express = require('express');
const mongoose = require('mongoose');
const MongoDBSession = require('connect-mongodb-session')(session)
const { MongoClient, ServerApiVersion } = require('mongodb')
const User = require('./Backend/User.js')
const Wallet = require('./Backend/Wallet.js')

const router = express.Router();
const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri)
var db = mongoose.connection

//getting all user wallets
router.get('/:id/wallets', async (req, res) => {
    await User.findById(req.params.id, (err, result) => {
        if (result) {
            res.json(result.wallet)
        } else {
            res.json('No Wallets Found')
        }
    })
})

//getting specific user wallet
router.get('/:id/:walletId', async (req, res) => {
    const user = await User.findById(req.params.id).exec();
    if (user === null) {
        res.status(404).json({message: 'wallet not found'});
    } else {
        user.wallet.forEach(element => {
            if (element === req.params.walletId) {
                await Wallet.findById(req.params.walletId, (err, result) => {
                    if (result) {
                        res.json(result);
                    } else {
                        res.status(500).json({message: 'No Wallets Found'});
                    }
                })
            }
        });
    }
})

//adding new wallet to user
router.put('/:id/:walletId', async (req, res) => {
    const user = await User.findById(req.params.id).exec();
    if (user.wallet.length === 10) {
        res.status(500).json({message: 'There are too many wallets associated with this account, please delete one.'})
    } else {
        user.wallet.push(req.params.walletId)
        user.save();
    }
})

//deleting wallet associated with user
router.delete('/:id/:walletId', async (req, res) => {
    const user = await User.findById(req.params.id).exec();
    user.wallet.forEach((element, index) => {
        if (element === req.params.walletId) {
            user.wallet.splice(index, 1)
        }
    })
    user.save();
})

module.exports = router