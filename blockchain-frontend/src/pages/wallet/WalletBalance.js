import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';

function WalletBalance(props) {
    const { wallet } = useWallet();
    const [web3, setWeb3] = useState(props.web3);
    const [searchAddress, setSearchAddress] = useState('');
    const [currentBalance, setCurrentBalance] = useState('0');
    const [searchedBalance, setSearchedBalance] = useState('0');

    useEffect(() => {
        if (wallet?.address && web3) {
            getBalance(wallet.address).then(balance => {
                setCurrentBalance(balance);
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
            const balance = await web3.eth.getBalance(address);
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
        }
    }

    return (
        <div>
            <h2>Wallet Balance</h2>
            <h3>Current Wallet</h3>
            <p>Address: {wallet?.address}</p>
            <p>Balance: {currentBalance} ETH</p>
            <h3>Search Wallet</h3>
            <input 
                type="text" 
                placeholder="Enter wallet address" 
                value={searchAddress} 
                onChange={(e) => setSearchAddress(e.target.value)} 
            />
            <button onClick={handleSearch}>Search</button>
            <p>Balance: {searchedBalance} ETH</p>
        </div>
    );
}

export default WalletBalance;