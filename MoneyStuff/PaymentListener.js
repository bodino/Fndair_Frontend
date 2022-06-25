const  Web3  = require("web3");

const web3 = new Web3('wss://ropsten.infura.io/ws/v3/d825deabe0454bbe8223e500dd8dd785');

async function findPayments(address,TokenArtifact){
    var food = 0;
    const contract = new web3.eth.Contract(
        TokenArtifact.abi,
        address
    );

   await contract.events.Payment({fromBlock:0} )
   .on('data', event => setArray(event));

   function setArray(event){
    console.log(event)
    food = event;
    }
}

module.exports = {findPayments}
