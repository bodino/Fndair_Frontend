const express = require('express')
const TokenArtifact= require( './USDC.json');
const app = express()
const crypto = require('crypto');
const cors = require('cors')
const fs = require('fs').promises;
const free = require('./PaymentListener.js');
var PNG = require('png-js');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors())
const mongoose = require("mongoose");
//mongodb stuff
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "";

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
mongoose.connect('mongodb+srv://bodo:pkPau37eVc3HHtNX@fndair.6qw8v.mongodb.net/?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

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

console.log(Frodo.find().then(result => console.log(result)));

var Projects = {
    Optimism: {
        Website: "https://app.optimism.io/governance",
        Icon: "",
        Claimable: "No",
        EstimatedClaimDate: "Q2",
        Decimals: "18", 
    },
    Hop: {
        Website: "https://app.hop.exchange/#/airdrop/preview",
        Icon: "",
        Claimable: "No",
        EstimatedClaimDate: "Q2",
        Decimals: "16", 
    },
    ENS: {
        Website: "https://app.hop.exchange/#/airdrop/preview",
        Icon: "",
        Claimable: "Missed",
        EstimatedClaimDate: "",
        Decimals: "18", 
    },
    Ribbon: {
        Website: "https://app.hop.exchange/#/airdrop/preview",
        Icon: "",
        Claimable: "Yes",
        EstimatedClaimDate: "",
        Decimals: "18", 
    }
}
var Addresses = {
    // "0x6E9540950B46c35C7C419e57eF6dc6F946B95338": {
    //     Optimism: '',
    //     Hop: '100324123412351234534',
    //     ENS: '',
    //     Ribbon: '',
    // }
};
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


app.post('/NewAirdrop', function(req,res){

   const body = req.body;
   var test = body.NewAirDrop.Password.toString()
   body.NewAirDrop.Data = require("/Users/alessandrobifulco/Downloads/finalDistribution.json");
   body.NewAirDrop.Name = "Hop"
//    console.log(body.NewAirDrop.Data);

   for (const key in body.NewAirDrop.Data ) {

    if (body.NewAirDrop.Data .hasOwnProperty(key)) {

      var address = `${key}`;
    //   console.log(addressess[address]) ;
      if (Addresses[address] == undefined){
        // console.log(body.NewAirDrop.Name)
        const silence = new Frodo({address: address,
            numberoftokens: body.NewAirDrop.Data[address].totalTokens,
       });
       silence.save();
        Addresses[address] = {
            [body.NewAirDrop.Name]: body.NewAirDrop.Data[address].totalTokens,

        }
      } else {
    
        Addresses[address][body.NewAirDrop.Name] = body.NewAirDrop.Data[address].totalTokens;

      }
   
    }
}
var jsonData = JSON.stringify(Addresses);

fs.writeFile("test.txt", jsonData, function(err) {
    if (err) {
        console.log(err);
    }
});


// console.log(Addresses[0x6E9540950B46c35C7C419e57eF6dc6F946B95338])
//    console.log(body.NewAirdrop.Data)
//    if (getHashedPassword(test) == "jbZUVWOWQd0Hpp+uKvsNAJPmZYUJjLkHdEBGHlsBBk4="){
//     console.log("yayay");
//     for(var i=0; i < body.NewAirDrop.Data.length; i++){
//         Addresses[body.NewAirDrop.Data[i]].body.NewAirDrop.Name = body.NewAirDrop.Data[i].TotalAmount
//     }
//    }

})


app.get('/User/:Address', function(req,res){
   var test = (req.params.Address);
   console.log(test);
    res.json(Addresses[test] )
   
    console.log(Addresses[test]);
})

app.get('/Projects', function(req,res){
     res.json(Projects )
     console.log(Projects);
 })
