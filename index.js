const express = require('express')
const TokenArtifact= require( './USDC.json');
const app = express()
const crypto = require('crypto');
const cors = require('cors')
const fs = require('fs').promises;
const free = require('./PaymentListener.js');
var bodyParser = require('body-parser');

const  Web3  = require("web3");
var Personal = require('web3-eth-personal');
const mongoose = require("mongoose");
var session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);

const { MongoClient, ServerApiVersion } = require('mongodb');
const Wallet = require('./Backend/Wallet.js');
const User = require('./Backend/User.js');
const Protocol = require('./Backend/Protocol.js');
const { METHODS } = require('http');
const cookieParser = require('cookie-parser');
const { disconnect } = require('process');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
}))
app.use(cookieParser());
const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}


const uri = 'mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority';
const web3 = new Web3('wss://ropsten.infura.io/ws/v3/d825deabe0454bbe8223e500dd8dd785');

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
mongoose.connect(uri);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

const store = new MongoDBSession({
    uri: uri,
    collection: "mysessions",
})
app.use(session(
    {key: 'userId',
    secret:"1231231",
    resave:false, 
    saveUninitialized:false,
    store: store,
    cookie:{
        httpOnly:true,
        maxAge:1000*60*60*24*7
    }
}));

//monitors payments
// free.findPayments('0x04C834Bd77fFe1B2828BAee3972A78aB01AB5377',TokenArtifact);
// free.findPayments('0x04C834Bd77fFe1B2828BAee3972A78aB01AB5377',TokenArtifact);


const kittySchema = new mongoose.Schema({
    address: "string",
    numberoftokens: "string",
  });

  const Frodo = mongoose.model('Frodo', kittySchema);

// const silence = new Kitten({
//     name: String
//   });
//   const fluffy = new Kitten({ name: 'fluffy' });

//   silence.save();

// console.log(Frodo.find().then(result => console.log(result)));

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// app.get('/:ID', function(req,res){
//     var jsonObj = require("/Users/alessandrobifulco/Desktop/frames/"+req.params.ID + ".json");
//     res.json({title :jsonObj })
// })

// app.get('/Images/:ID', function(req,res){
//     res.sendFile("/Users/alessandrobifulco/Desktop/frames/"+req.params.ID);
// })

app.listen(3001, function (){
    console.log("listening port 3001")
})


// app.post('/NewAirdrop', function(req,res){

//    const body = req.body;
//    var test = body.NewAirDrop.Password.toString()
//    body.NewAirDrop.Data = require("/Users/alessandrobifulco/Downloads/finalDistribution.json");
//    body.NewAirDrop.Name = "Hop"
// //    console.log(body.NewAirDrop.Data);

//    for (const key in body.NewAirDrop.Data ) {

//     if (body.NewAirDrop.Data .hasOwnProperty(key)) {

//       var address = `${key}`;
//     //   console.log(addressess[address]) ;
//       if (Addresses[address] == undefined){
//         // console.log(body.NewAirDrop.Name)
//         const silence = new Frodo({address: address,
//             numberoftokens: body.NewAirDrop.Data[address].totalTokens,
//        });
//        silence.save();
//         Addresses[address] = {
//             [body.NewAirDrop.Name]: body.NewAirDrop.Data[address].totalTokens,

//         }
//       } else {
    
//         Addresses[address][body.NewAirDrop.Name] = body.NewAirDrop.Data[address].totalTokens;

//       }
   
//     }
// }
// var jsonData = JSON.stringify(Addresses);

// fs.writeFile("test.txt", jsonData, function(err) {
//     if (err) {
//         console.log(err);
//     }
// });


// console.log(Addresses[0x6E9540950B46c35C7C419e57eF6dc6F946B95338])
//    console.log(body.NewAirdrop.Data)
//    if (getHashedPassword(test) == "jbZUVWOWQd0Hpp+uKvsNAJPmZYUJjLkHdEBGHlsBBk4="){
//     console.log("yayay");
//     for(var i=0; i < body.NewAirDrop.Data.length; i++){
//         Addresses[body.NewAirDrop.Data[i]].body.NewAirDrop.Name = body.NewAirDrop.Data[i].TotalAmount
//     }
//    }

// })

// might be better to .exec() to return boolean
app.get('/wallet/:Address', function(req,res){
  Wallet.findById(req.params.Address, function (err, result) {
    if (result){
        res.json(result)
        
    }
    else{
        res.json("No Address Found")
    }
});
  
})

app.get('/Projects', function(req,res){
    Protocol.find(function (err, result) {
        if (result){
            
            res.json(result)
        }
        else{
            res.json("No Projects Found")
        }
    });
 })

 app.get('/newuser/:Address', function(req,res){
     var address = req.params.Address;
     var date = new Date()
     console.log(Web3.utils.isAddress(req.params.Address))
  
     var hashedAddress = getHashedPassword(address);

 })

app.get('/login', isAuth, function(req,res){
    User.findById(req.session.address).populate("wallet").then(result => {
        if (!result.subscriptionInfo.status){
            for (var i =0; i <result.wallet.length; i++){
                for (var j = 0; j <result.wallet[i].data.length; j++){
                    result.wallet[i].data[j].protocol = 'Hidden';
                }
            }
            result.loggedin = true;
            res.json(result)
        } else {
            result.loggedin = true
            res.json(result)
        }
    })
    // res.json({loggedin: req.session.isAuth});
})

app.get('/disconnect', isAuth, function(req,res){
    req.session.destroy();
    res.json({loggedin: false});
})

app.post('/login', function(req,res){
   const body = req.body;
   console.log(body);
   message = body.UserInfo.message;
   signature = body.UserInfo.signature;
   address = body.UserInfo.address
   var generatedaddress = web3.eth.accounts.recover(message, signature);
    // console.log(food);
    if (address === generatedaddress){
        console.log("1")
        User.findById(address).populate("wallet").then(result => {
            console.log(result)
            if (result){
                console.log("3")
                req.session.isAuth = "true";
                req.session.address = address;
                res.json(result)
                
            }
            else{
                console.log("4")
                const user = new User({
                    _id: address,
                    wallet: [address],
                    subscriptionInfo: {
                        duration: 0,
                        joinDate: '',
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
    
                user.save(function(err, user) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.session.isAuth = true;
                        req.session.address = address;
                    }
                })
            }
        });
    }
})