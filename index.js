const express = require('express')
const TokenArtifact = require('./USDC.json')
const app = express()
const crypto = require('crypto')
const cors = require('cors')
const fs = require('fs').promises
const free = require('./PaymentListener.js')
var bodyParser = require('body-parser')

const Web3 = require('web3')
var Personal = require('web3-eth-personal')
const mongoose = require('mongoose')
var session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)

const { MongoClient, ServerApiVersion } = require('mongodb')
const Wallet = require('./Backend/Wallet.js')
const User = require('./Backend/User.js')
const Protocol = require('./Backend/Protocol.js')
const { METHODS } = require('http')
const cookieParser = require('cookie-parser')
const { disconnect } = require('process')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  }),
)
app.use(cookieParser())

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next()
  } else {
    res.status(401).send('Unauthorized')
  }
}

const uri =
  'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority'
const web3 = new Web3(
  'wss://ropsten.infura.io/ws/v3/d825deabe0454bbe8223e500dd8dd785',
)

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
mongoose.connect(uri)
var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))

db.once('open', function () {
  console.log('Connection Successful!')
})

const store = new MongoDBSession({
  uri: uri,
  collection: 'mysessions',
})
app.use(
  session({
    key: 'userId',
    secret: '1231231',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
)

//getting routes
const walletRouter = require('./routes/wallets');
app.use('./wallet', walletRouter);

const userRouter = require('./routes/users');
app.use('./user', userRouter);

const pricingRouter = require('./routes/pricing');
app.use('./pricing', pricingRouter);

const projectsRouter = require('./routes/projects')
app.use('./projects', projectsRouter);

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash('sha256')
  const hash = sha256.update(password).digest('base64')
  return hash
}

app.listen(3001, function () {
  console.log('listening port 3001')
})


app.get('/newuser/:Address', function (req, res) {
  var address = req.params.Address
  var date = new Date()
  console.log(Web3.utils.isAddress(req.params.Address))

  var hashedAddress = getHashedPassword(address)
})

app.get('/login', isAuth, function (req, res) {
  var addresses
  User.findById(req.session.address).then((result) => {
    addresses = result.wallet
  })
  User.findById(req.session.address)
    .populate('wallet')
    .then((result) => {
      result.subscriptionInfo.status = 'addresses'
      result = result.toObject()
      result.followedAddresses = addresses

      console.log(result)
      if (!result.subscriptionInfo.status) {
        for (var i = 0; i < result.wallet.length; i++) {
          for (var j = 0; j < result.wallet[i].data.length; j++) {
            result.wallet[i].data[j].protocol = 'Hidden'
          }
        }
        result.loggedin = true
        res.json(result)
      } else {
        result.loggedin = true
        res.json(result)
      }
    })
})

app.get('/disconnect', isAuth, function (req, res) {
  req.session.destroy()
  res.json({ loggedin: false })
})


app.post('/login', function (req, res) {
  const body = req.body
  console.log(body)
  message = body.UserInfo.message
  signature = body.UserInfo.signature
  address = body.UserInfo.address
  var generatedaddress = web3.eth.accounts.recover(message, signature)
  // console.log(food);
  if (address === generatedaddress) {
    console.log('1')
    User.findById(address)
      .then((result) => {
        console.log(result)
        if (result) {
          console.log('3')
          req.session.isAuth = 'true'
          req.session.address = address
          var addresses
          addresses = result.wallet
        
          User.findById(req.session.address)
            .populate('wallet')
            .then((result) => {
              result.subscriptionInfo.status = 'addresses'
              result = result.toObject()
              result.followedAddresses = addresses

              console.log(result)
              if (!result.subscriptionInfo.status) {
                for (var i = 0; i < result.wallet.length; i++) {
                  for (var j = 0; j < result.wallet[i].data.length; j++) {
                    result.wallet[i].data[j].protocol = 'Hidden'
                  }
                }
                result.loggedin = true
                res.json(result)
              } else {
                result.loggedin = true
                res.json(result)
              }
            })
        } else {
          console.log('4')
          const user = new User({
            _id: address,
            wallet: [address],
            subscriptionInfo: {
              duration: 0,
              joinDate: '',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          user.save(function (err, user) {
            if (err) {
              console.log(err)
            } else {
              req.session.isAuth = true
              req.session.address = address
              
              res.json(user.toObject());
              
            }
          })
        }
      })
  }
})

//allows user to add wallet to their account
app.post('/addwallet', isAuth, function (req, res) {
    const body = req.body
    var newAddress = body.Info.Address;
    async function addwallet(userAddress, newAddress) {
        await User.findOneAndUpdate({id: userAddress},
            {
                $addToSet: {
                    wallet: newAddress
                }
            }   
            )
        }  
    addwallet(req.session.address, newAddress);
  })

  //allows user to remove wallet from their account
  app.post('/removewallet', isAuth, function (req, res) {
    const body = req.body
    var newAddress = body.Info.Address;
    async function removeWallet(userAddress, newAddress) {
        await User.findOneAndUpdate({id: userAddress},
            {
                $pull: {
                    wallet: newAddress
                }
            }   
            )
        }  
    removeWallet(req.session.address, newAddress);
  })
