var express = require('express');
var router = express.Router();
var { ethers } = require('ethers');
const provider = new ethers.providers.InfuraProvider("maticmum", "f22f7a7918244c1ba50f5ce922c6ef10");

// you can provide your wallet's private key here to use it as a relayer

const wallet = new ethers.Wallet("RELAYER_PRIVATE_KEY", provider);
console.log("ready");
router.get("/", (req, res) => res.render("index"))


router.post('/', async function (req, res, next) {
	
	const abi = req.body.contract.abi;
	const contractAddress = req.body.contract.address;

	const contract = new ethers.Contract(contractAddress, abi, wallet);

	let data = req.body.originalTX;
	let sig = req.body.txSignatureParsed;
	let sentTx;

	if (req.body.function === "handleExecute") {
		sentTx = await contract[req.body.function](data.target, data.relative, data.amount, data.price,
			sig.messageHash, sig.v, sig.r, sig.s);
	}

	if (req.body.function === "execute"){
		sentTx = await contract[req.body.function](data.to, data.value,
			sig.messageHash, sig.v, sig.r, sig.s);
	}

	res.send({ txHash: sentTx.hash });
});

module.exports = router;
