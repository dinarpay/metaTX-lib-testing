import axios from 'axios';
const { ethers } = require('ethers');
const Web3 = require("web3");

const abiCoder = new ethers.utils.AbiCoder();

const mumbaiProvider = new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/");
const web3Mumbai = new Web3(mumbaiProvider);

class Wallet {

  constructor() {
    const privateKey = localStorage.getItem('privateKey');

    // create a wallet from localstorage privateKey
    // or create a new one if no privateKey is found
    this.mumbai_wallet = privateKey != null
      ? web3Mumbai.eth.accounts.privateKeyToAccount(privateKey)
      : web3Mumbai.eth.accounts.create();

    if (privateKey === "null")
      localStorage.setItem('privateKey', this.mumbai_wallet.privateKey);

    this.address = this.mumbai_wallet.address;
    this.gasStations = {};
  }


  attachGasStation = (gas_station, api_key) => {
    this.gasStations[gas_station] = api_key;
  }

}

class Contract {

  constructor() {
    this.polygonContract = {};
    this.optimismContract = {};
    this.solanaContract = {};
  }

  polygon(abi, contractAddress) {
    this.polygonContract = {
      abi: abi,
      address: contractAddress
    }
  }

  getChainJson(chain) {
    if (chain === "polygon") {
      return this.polygonContract;
    }
    if (chain === "optimism") {
      return this.optimismContract;
    }
  }

  attach(wallet) {
    return new ContractWithWallet(this, wallet);
  }

}

function enableNoSuchMethod(obj) {
  return new Proxy(obj, {
    get(target, p) {
      if (p in target) {
        return target[p];
      }
      else if (target["chain"] && target["toGasStation"]) {
        return async function (...args) {
          return await target.handleContractFunctionCall.call(target, p, args);
        }
      }
      else {
        return function (...args) {
          return target.__noSuchMethod__.call(target, p, args);
        }
      }
    }
  });
}

class ContractWithWallet {

  constructor(contract, wallet) {
    this.contract = contract;
    this.wallet = wallet;
    this.chain = null;
    this.toGasStation = null;
    this.__noSuchMethod__ = function (name, args) {
      throw new Error("Chain or Relayer are not defined! Use both 'on' and 'to' methods.");
    }
    return enableNoSuchMethod(this);
  }

  async handleContractFunctionCall(name, args) {
    let contractJSON = this.contract.getChainJson(this.chain);
    let contractABI = contractJSON.abi;
    let contractAddress = contractJSON.address;

    // get the function definition
    let functionABI = contractABI.filter(function (item) {
      return item.name === name && item.type === "function";
    });

    if (functionABI.length === 0)
      throw new Error(`No such function in the contract provided at address ${contractAddress}!`);

    functionABI = functionABI[0];

    // minus 4 because of the (hash, v, r, s)
    let actualNumParams = functionABI.inputs.length - 4;

    if (actualNumParams !== args.length)
      throw new Error(`Invalid number of arguments! \nExpected ${functionABI.inputs.length} but instead got ${args.length}`)

    // TODO check for types validity

    // for (let i = 0; i < args.length; i += 1) {
    //   if (functionABI.inputs[i].type === "address") 
    //     assert(args[i][0] === "0" && args[i][1] === "x", `The parameter ${functionABI.inputs[i].name} should be of type address!`) 

    //   if(functionABI.inputs[i].type === "string")
    //     assert(typeof(args[i]) === String, `The parameter ${functionABI.inputs[i].name} should be of type string!`)

    //   if(["uint", "uint8", "uin"]functionABI.inputs[i].type === "uint" || )

    // }

    let argsJSON = args.map((value, index) => {
      return {
        name: functionABI.inputs[index].name,
        value: value,
        type: functionABI.inputs[index].type
      }
    });

    return this.sendSignedTransaction(name, argsJSON);
  }

  async sendSignedTransaction(functionName, argsJSON) {

    /* contains a key pair where 
    {
      param1_name: param1_value,
      param2_name: param2_value,
      ...
    }
    */
    let argsNames = argsJSON.reduce(
      (obj, item) => Object.assign(obj, { [item.name]: item.value }), {}
    );

    // array with the params types (in the same order as in the function definition)
    let argsTypes = argsJSON.map((param) => (param["type"]));

    // array with the values of the params 
    let argsValues = argsJSON.map((param) => (param["value"]));

    let data = {
      ...argsNames,
    };

    console.log("DATA ", data);

    let toSignData = abiCoder.encode(
      argsTypes,
      argsValues,
    )

    let signature = await this.wallet.mumbai_wallet.sign(toSignData, this.wallet.mumbai_wallet.privateKey);

    console.log("Signature", signature);

    let txHash = await axios.post(this.toGasStation, {
      function: functionName,
      args: argsJSON,
      contract: this.contract.getChainJson(this.chain),
      txSignatureParsed: signature,
      originalTX: data
    });

    return txHash;
  }

  to(gas_station) {
    this.toGasStation = this.wallet.gasStations[gas_station];
    return this;
  }

  on(chain) {
    this.chain = chain;
    return this;
  }
}

export {
  Wallet,
  Contract
}
