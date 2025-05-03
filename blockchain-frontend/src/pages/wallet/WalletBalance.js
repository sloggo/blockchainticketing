import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { formatAddress } from '../../utils/formatAddress';

function WalletBalance(props) {
    const { wallet } = useWallet();
    const [web3, setWeb3] = useState(props.web3);
    const [searchAddress, setSearchAddress] = useState('');
    const [currentBalance, setCurrentBalance] = useState('0');
    const [searchedBalance, setSearchedBalance] = useState('0');
    const [slogTokenBalance, setSlogTokenBalance] = useState('0');
    const [searchedSlogTokenBalance, setSearchedSlogTokenBalance] = useState('0');

    const IERC20_ABI = [
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "spender",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "sender",
                    "type": "address"
                },
                {
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];

    useEffect(() => {
        if (wallet?.address && web3) {
            getBalance(wallet.address).then(balance => {
                setCurrentBalance(balance);
            });
            getSlogTokenBalance(wallet.address).then(balance => {
                setSlogTokenBalance(balance);
            });
        }
    }, [wallet?.address, web3]);

    const getBalance = async (address) => {
        if (!web3) {
            console.log("No web3 instance provided");
            return "No web3 instance provided";
        }
        if (!address || !web3.utils.isAddress(address)) {
            console.log("Invalid Ethereum address:", address);
            return "Invalid address";
        }
        try {
            const balance = await web3.eth.getBalance(formatAddress(address));
            return web3.utils.fromWei(balance, 'ether');
        } catch (err) {
            console.error("Error getting balance:", err);
            return "Error";
        }
    }

    const handleSearch = async () => {
        if (searchAddress) {
            const balance = await getBalance(searchAddress);
            setSearchedBalance(balance);
            const slogTokenBalance = await getSlogTokenBalance(searchAddress);
            setSearchedSlogTokenBalance(slogTokenBalance);
        }
    }

    const getSlogTokenBalance = async (address) => {
        if (!web3) {
            console.log("No web3 instance provided");
            return "No web3 instance provided";
        }
        const tokenAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

        if(!web3.utils.isAddress(address) || !web3.utils.isAddress(tokenAddress)) {
            console.log("Invalid Ethereum address:", address);
            return "Invalid address";
        }

        try {
            const contract = new web3.eth.Contract(IERC20_ABI, formatAddress(tokenAddress));
            const balance = await contract.methods.balanceOf(formatAddress(address)).call();
            return web3.utils.fromWei(balance, 'ether');
        } catch (err) { 
            console.error("Error getting sloggos balance:", err);
            return "Error";
        }
    }

    return (
        <div>
            <h2>Wallet Balance</h2>
            <div>
                <h3>Current Wallet</h3>
                <p>Address: {formatAddress(wallet?.address)}</p>
                <p>Balance: {currentBalance} ETH</p>
                <p>sloggos Balance: {slogTokenBalance} s</p>
            </div>
            <div>
                <h3>Search Wallet</h3>
                <input 
                type="text" 
                placeholder="Enter wallet address" 
                value={searchAddress} 
                onChange={(e) => setSearchAddress(e.target.value)} 
                />
                <button onClick={handleSearch}>Search</button>
                <p>Balance: {searchedBalance} ETH</p>
                <p>sloggos Balance: {searchedSlogTokenBalance} s</p>
            </div>
        </div>
    );
}

export default WalletBalance;