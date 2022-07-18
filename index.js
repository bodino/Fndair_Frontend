const express = require('express')
const TokenArtifact = require('./USDC.json')
const app = express()
const crypto = require('crypto')
const cors = require('cors')
const fs = require('fs').promises
const free = require('./MoneyStuff/PaymentListener.js')
const schedule = require('node-schedule');

var bodyParser = require('body-parser')
// functions


const updator = require('./MoneyStuff/tokenpriceupdator.js')
const payments = require('./MoneyStuff/PaymentListener.js')
const subscriptionPriceUpdator = require('./MoneyStuff/subscriptionpriceupdator.js')
const tokenClaimUpdator = require('./Backend/NewTokenListener.js')

// functions
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
    origin: ['https://funny-vacherin-5815be.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
app.set('trust proxy', 1);
app.use(
  session({
    key: 'userId',
    secret: '1231231',
    resave: true,
    saveUninitialized: false,
    store: store,
    proxy: true,
    cookie: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
)

//getting routes
const walletRouter = require('./Routes/wallets');
app.use('/wallet', isAuth, walletRouter);

const loginRouter = require('./Routes/login');
app.use('/login', loginRouter);

const disconnectRouter = require('./Routes/disconnect');
app.use('/disconnect', disconnectRouter);

const userRouter = require('./Routes/users');
app.use('/user', isAuth, userRouter);

const pricingRouter = require('./Routes/pricing');
app.use('/pricing', pricingRouter);

const projectsRouter = require('./Routes/projects')
app.use('/projects', projectsRouter);

app.listen(3001, function () {
  console.log('listening port 3001')
})




//updates price every hour

setInterval(function () {
  updator.tokenUsdPrice();
}, 10 * 60 * 60 * 1000);

setInterval(function () {
  //ethereum
  payments.findPayments('wss://eth-goerli.alchemyapi.io/v2/Zj3jUExZDp-TjSmxzEl0mjQs5fi3gwRV','ethereum','ethereum')
  //matic
  payments.findPayments('https://polygon-mainnet.g.alchemy.com/v2/wNblPFs6UL8D6V1GQ-8-k_cBWfEboHiW','matic-network','matic-network')
  //optimism
  payments.findPayments('https://opt-mainnet.g.alchemy.com/v2/scDqvE70_7BNJOy737TIuUnxVvCVxIaR','ethereum','optimism')
  //arbitrum
  payments.findPayments('https://arb-mainnet.g.alchemy.com/v2/E5KgIS5YtqEMYxS6MIddPz0yx7sHlvXt','ethereum','arbitrum')
}, 20000);

//updates price of subscriptions every day at midnight
schedule.scheduleJob('0 0 * * *', function(){
  subscriptionPriceUpdator.subscriptionPrice()
});

// for updating database, for production
// tokenClaimUpdator.keepAllProtocolsUpToDate()
