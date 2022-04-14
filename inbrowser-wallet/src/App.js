import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { Wallet, Contract } from './wallet-library/MetaTX'

const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "relayer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "Executed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "contract_encoding",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "relayer_encoding",
				"type": "bytes32"
			}
		],
		"name": "Hash",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "txHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "execute",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "relative",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "txHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "handleExecute",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
const contractAddress = "0xc009D3f4B96Ce809015D4BA36d5788831D2233d7"

function App() {
	const [tx, setTx] = useState();

	const executeFunction = async function () {
		setTx("Creating a new wallet")

		let new_wallet = new Wallet();

		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log("New wallet address " + new_wallet.address)

		setTx("Attaching 'questbook' relayer to the wallet")

		new_wallet.attachGasStation('questbook', 'http://localhost:3001/')

		await new Promise(resolve => setTimeout(resolve, 1000));

		let contract = new Contract();

		contract.polygon(abi, contractAddress)

		let contractWithWallet = contract.attach(new_wallet);

		setTx("Submitting gasless transaction ...")
		let response = await contractWithWallet
			.on("polygon")
			.to("questbook")
			.execute(new_wallet.address, 21000);

		await new Promise(resolve => setTimeout(resolve, 1000));

		setTx("Created Tx on chain : " + response.data.txHash);
	}

	const handleExecuteFunction = async function () {
		setTx("Creating a new wallet")

		let new_wallet = new Wallet();

		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log("New wallet address " + new_wallet.address)

		setTx("Attaching 'questbook' relayer to the wallet")

		new_wallet.attachGasStation('questbook', 'http://localhost:3001/')

		await new Promise(resolve => setTimeout(resolve, 1000));

		let contract = new Contract();

		contract.polygon(abi, contractAddress)

		let contractWithWallet = contract.attach(new_wallet);

		setTx("Submitting gasless transaction ...")
		let response = await contractWithWallet
			.on("polygon")
			.to("questbook")
			.handleExecute(new_wallet.address, contractAddress, 10, 21000);

		await new Promise(resolve => setTimeout(resolve, 1000));

		setTx("Created Tx on chain : " + response.data.txHash);
	}

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<button onClick={() => executeFunction()}>Create a transaction to execute</button>
				<button onClick={() => handleExecuteFunction()}>Create a transaction to handleExecute</button>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					{tx}
				</a>
			</header>
		</div>
	);
}

export default App;
