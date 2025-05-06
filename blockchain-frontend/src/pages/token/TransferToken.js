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

function TransferToken(props) {
    const { wallet, setWallet } = useWallet();
    const [amount, setAmount] = useState(0);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [ethBalance, setEthBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
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
                    const balance = await web3.eth.getBalance(formatAddress(wallet.address));
                    setEthBalance(web3.utils.fromWei(balance, 'ether'));

                    const tokenBalance = await contract.methods.balanceOf(formatAddress(wallet.address)).call();
                    setTokenBalance(web3.utils.fromWei(tokenBalance, 'ether'));
                } catch (error) {
                    console.error("Error fetching balances:", error);
                }
            }
        };
        fetchBalances();
    }, [wallet?.address]);

    const transferTokens = async () => {
        if (!wallet || !wallet.keystore) {
            alert("Please login with your wallet first");
            return;
        }

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (parseFloat(tokenBalance) < amount) {
            alert(`Insufficient token balance. You only have ${tokenBalance} SLOGGOS`);
            return;
        }

        console.log("Wallet state:", wallet);
        console.log("Keystore:", wallet.keystore);
        console.log("Contract address:", contractAddress);
        console.log("Amount:", amount);
        console.log("Current token balance:", tokenBalance);

        let password = prompt("Please enter your wallet password:", "");
        if (!password) {
            alert("Password is required to proceed with the transaction");
            return;
        }

        setIsLoading(true);
        
        try {
            console.log("Decrypting wallet...");
            const account = await web3.eth.accounts.decrypt(wallet.keystore, password);
            console.log("Decrypted account:", account);
            
            if (!account || !account.privateKey) {
                throw new Error("Failed to decrypt wallet");
            }

            // First approve the contract to spend tokens
            console.log("Approving tokens...");
            const approveTx = contract.methods.approve(
                formatAddress(contractAddress),
                web3.utils.toWei(amount.toString(), 'ether')
            );

            const approveData = approveTx.encodeABI();
            const gasPrice = await web3.eth.getGasPrice();

            const approveTransaction = {
                from: formatAddress(wallet.address),
                to: formatAddress(contractAddress),
                gas: 200000,
                gasPrice: gasPrice,
                data: approveData
            };

            console.log("Signing approval transaction...");
            const signedApproveTx = await web3.eth.accounts.signTransaction(approveTransaction, account.privateKey);
            
            console.log("Sending approval transaction...");
            await web3.eth.sendSignedTransaction(signedApproveTx.rawTransaction);

            // Now transfer tokens to the contract
            console.log("Transferring tokens...");
            const transferTx = contract.methods.transfer(
                formatAddress(contractAddress),
                web3.utils.toWei(amount.toString(), 'ether')
            );

            const transferData = transferTx.encodeABI();

            const transferTransaction = {
                from: formatAddress(wallet.address),
                to: formatAddress(contractAddress),
                gas: 200000,
                gasPrice: gasPrice,
                data: transferData
            };

            console.log("Signing transfer transaction...");
            const signedTransferTx = await web3.eth.accounts.signTransaction(transferTransaction, account.privateKey);
            
            console.log("Sending transfer transaction...");
            const receipt = await web3.eth.sendSignedTransaction(signedTransferTx.rawTransaction);
            
            console.log("Transaction receipt:", receipt);
            alert("Tokens transferred successfully! Transaction hash: " + receipt.transactionHash);

            // Refresh balances
            const newBalance = await web3.eth.getBalance(formatAddress(wallet.address));
            setEthBalance(web3.utils.fromWei(newBalance, 'ether'));

            const newTokenBalance = await contract.methods.balanceOf(formatAddress(wallet.address)).call();
            setTokenBalance(web3.utils.fromWei(newTokenBalance, 'ether'));

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
                        const decodedError = contract.methods.transfer().decodeError(error.data);
                        errorMessage += decodedError;
                    } catch (e) {
                        errorMessage += "Could not decode error data.";
                    }
                }
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <h1>Sell Tokens</h1>
            <div>
                <p>Your Sloggos Balance: {tokenBalance} SLOGGOS</p>
                <p>Your ETH Balance: {ethBalance} ETH</p>
                <p>Token Price: {TOKEN_PRICE} ETH per token</p>
                <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Enter number of tokens to sell"
                    min="1"
                    step="1"
                    disabled={isLoading || parseFloat(tokenBalance) === 0}
                />
                <p>You will receive: {amount * TOKEN_PRICE} ETH</p>
                <button 
                    onClick={transferTokens}
                    disabled={isLoading || parseFloat(tokenBalance) === 0}
                    style={{ 
                        opacity: (isLoading || parseFloat(tokenBalance) === 0) ? 0.5 : 1,
                        cursor: (isLoading || parseFloat(tokenBalance) === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Processing...' : 'Sell Tokens'}
                </button>
                {parseFloat(tokenBalance) === 0 && (
                    <p style={{ color: 'red', marginTop: '10px' }}>
                        You don't have any tokens to sell.
                    </p>
                )}
            </div>
        </div>
    );
}

export default TransferToken;