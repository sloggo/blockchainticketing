import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { formatAddress } from '../../utils/formatAddress';
import Web3 from 'web3';

const IERC20_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_symbol",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "_decimals",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "initialSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "buyToken",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

function BuyToken(props) {
    const { wallet, setWallet } = useWallet();
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [contractBalance, setContractBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const web3 = props.web3;
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const TOKEN_PRICE = 0.00001;

    const contract = new web3.eth.Contract(IERC20_ABI, formatAddress(contractAddress));

    useEffect(() => {
        const savedWallet = localStorage.getItem('wallet');
        if (savedWallet) {
            setWallet(JSON.parse(savedWallet));
        }
    }, [setWallet]);

    useEffect(() => {
        const fetchBalances = async () => {
            if (wallet?.address) {
                try {
                    setIsInitialLoading(true);
                    const isConnected = await web3.eth.net.isListening();
                    if (!isConnected) {
                        throw new Error("Not connected to the network");
                    }

                    const balance = await web3.eth.getBalance(formatAddress(wallet.address));
                    setBalance(web3.utils.fromWei(balance, 'ether'));

                    const contractTokenBalance = await contract.methods.balanceOf(formatAddress(contractAddress)).call();
                    setContractBalance(web3.utils.fromWei(contractTokenBalance, 'ether'));
                } catch (error) {
                    console.error("Error fetching balances:", error);
                    alert("Error connecting to the network. Please check your connection and try again.");
                } finally {
                    setIsInitialLoading(false);
                }
            }
        };
        fetchBalances();
    }, [wallet?.address]);

    const buyToken = async () => {
        if (parseFloat(contractBalance) === 0) {
            alert("No tokens available in the contract");
            return;
        }

        if (!wallet || !wallet.keystore) {
            alert("Please login with your wallet first");
            return;
        }

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        const totalCost = amount * TOKEN_PRICE;
        const requiredAmount = totalCost + 0.001;
        if (parseFloat(balance) < requiredAmount) {
            alert(`Insufficient funds. You need ${requiredAmount} ETH (including gas), but you only have ${balance} ETH`);
            return;
        }

        console.log("Wallet state:", wallet);
        console.log("Keystore:", wallet.keystore);
        console.log("Contract address:", contractAddress);
        console.log("Amount:", amount);
        console.log("Total cost:", totalCost);
        console.log("Current balance:", balance);

        let password = prompt("Please enter your wallet password:", "");
        if (!password) {
            alert("Password is required to proceed with the transaction");
            return;
        }

        setIsLoading(true);
        
        try {
            const isConnected = await web3.eth.net.isListening();
            if (!isConnected) {
                throw new Error("Not connected to the network");
            }

            console.log("Decrypting wallet...");
            const account = await web3.eth.accounts.decrypt(wallet.keystore, password);
            console.log("Decrypted account:", account);
            
            if (!account || !account.privateKey) {
                throw new Error("Failed to decrypt wallet");
            }

            try {
                const code = await web3.eth.getCode(formatAddress(contractAddress));
                if (code === '0x') {
                    throw new Error("Contract not deployed at this address");
                }
                console.log("Contract code found:", code.slice(0, 100) + "...");
            } catch (error) {
                console.error("Error checking contract:", error);
                throw new Error("Failed to verify contract deployment");
            }

            try {
                const methods = contract.methods;
                console.log("Available contract methods:", Object.keys(methods));
                if (!methods.buyToken) {
                    throw new Error("buyToken method not found in contract");
                }
            } catch (error) {
                console.error("Error checking contract methods:", error);
                throw new Error("Contract ABI might be incorrect");
            }

            console.log("Preparing transaction...");
            const transaction = contract.methods.buyToken();
            const encodedABI = transaction.encodeABI();

            const gasPrice = await web3.eth.getGasPrice();
            console.log("Current gas price:", gasPrice);

            const tx = {
                from: formatAddress(wallet.address),
                to: formatAddress(contractAddress),
                gas: 200000,
                gasPrice: gasPrice,
                data: encodedABI,
                value: web3.utils.toWei(totalCost.toString(), 'ether')
            };

            console.log("Transaction details:", tx);

            console.log("Signing transaction...");
            const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
            console.log("Signed transaction:", signedTx);

            console.log("Sending transaction...");
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log("Transaction receipt:", receipt);
            alert("Transaction successful! Transaction hash: " + receipt.transactionHash);

            const newBalance = await web3.eth.getBalance(formatAddress(wallet.address));
            setBalance(web3.utils.fromWei(newBalance, 'ether'));

            const newContractBalance = await contract.methods.balanceOf(formatAddress(contractAddress)).call();
            setContractBalance(web3.utils.fromWei(newContractBalance, 'ether'));

        } catch (error) {
            console.error("Transaction failed:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                data: error.data,
                stack: error.stack
            });
            
            let errorMessage = "Transaction failed: ";
            if (error.message.includes("execution reverted")) {
                errorMessage += "Contract execution reverted. ";
                if (error.data) {
                    try {
                        const decodedError = contract.methods.buyToken().decodeError(error.data);
                        errorMessage += decodedError;
                    } catch (e) {
                        errorMessage += "Could not decode error data.";
                    }
                }
            } else if (error.message.includes("Unknown block")) {
                errorMessage += "Network connection error. Please check your connection and try again.";
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Token</h1>
            <div className="bg-white shadow rounded-lg p-6">
                {isInitialLoading ? (
                    <div className="space-y-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full animate-loading-bar"></div>
                        </div>
                        <p className="text-center text-gray-600">Loading token information...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">Contract Sloggos Balance: <span className="font-medium">{contractBalance} SLOGGOS</span></p>
                        <p className="text-gray-600">Current Balance: <span className="font-medium">{balance} ETH</span></p>
                        <p className="text-gray-600">Token Price: <span className="font-medium">{TOKEN_PRICE} ETH per token</span></p>
                        
                        <div className="mt-4">
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                placeholder="Enter number of tokens"
                                min="1"
                                step="1"
                                disabled={isLoading || parseFloat(contractBalance) === 0}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <p className="text-gray-600">Total Cost: <span className="font-medium">{amount * TOKEN_PRICE} ETH</span></p>
                        
                        <button 
                            onClick={buyToken}
                            disabled={isLoading || parseFloat(contractBalance) === 0}
                            className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Processing...' : parseFloat(contractBalance) === 0 ? 'No Tokens Available' : 'Buy Tokens'}
                        </button>

                        {parseFloat(contractBalance) === 0 && (
                            <p className="mt-4 text-red-600 text-sm">
                                No tokens available in the contract. Please try again later.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuyToken;