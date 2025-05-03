import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import Web3 from 'web3';

function Wallet() {
    const { wallet, setWallet } = useWallet();
    const [error, setError] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [privateKey, setPrivateKey] = useState('');

    useEffect(() => {
        // Load wallet from localStorage on component mount
        const savedWallet = localStorage.getItem('wallet');
        if (savedWallet) {
            setWallet(JSON.parse(savedWallet));
        }
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const keystore = JSON.parse(e.target.result);
                const walletData = { 
                    ...wallet,
                    keystore,
                    address: keystore.address,
                    isLoggedIn: true 
                };
                setWallet(walletData);
                localStorage.setItem('wallet', JSON.stringify(walletData));
            } catch (err) {
                setError('Invalid keystore file');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const handleKeyLogin = async () => {
        if (!publicKey || !privateKey) {
            setError('Please enter both public and private keys');
            return;
        }
        try {
            const web3 = new Web3();
            
            // Remove '0x' prefix if present
            const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
            
            // Validate private key
            const account = web3.eth.accounts.privateKeyToAccount('0x' + cleanPrivateKey);
            if (!account) {
                throw new Error('Invalid private key');
            }

            const password = prompt("Enter a password to encrypt your keys:", "");
            if (!password) {
                setError('Password is required');
                return;
            }

            const keystore = await web3.eth.accounts.encrypt('0x' + cleanPrivateKey, password);
            const walletData = {
                ...wallet,
                keystore,
                address: publicKey.toLowerCase(),
                isLoggedIn: true
            };
            setWallet(walletData);
            localStorage.setItem('wallet', JSON.stringify(walletData));
        } catch (err) {
            setError('Invalid keys: ' + err.message);
            console.error(err);
        }
    };

    const handleLogout = () => {
        setWallet({
            keystore: null,
            address: null,
            isLoggedIn: false
        });
        localStorage.removeItem('wallet');
    };

    return (
        <div>
            <h1>Wallet</h1>
            <div>
                {!wallet.isLoggedIn ? (
                    <div>
                        <h3>Upload Keystore File</h3>
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            id="keystore-upload"
                        />
                        <label htmlFor="keystore-upload" style={{ cursor: 'pointer' }}>
                            Choose File
                        </label>
                        
                        <h3>Or Enter Keys</h3>
                        <div>
                            <input
                                type="text"
                                placeholder="Public Key (0x...)"
                                value={publicKey}
                                onChange={(e) => setPublicKey(e.target.value)}
                                style={{ marginBottom: '10px', width: '100%' }}
                            />
                            <input
                                type="password"
                                placeholder="Private Key (0x... or without 0x)"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                style={{ marginBottom: '10px', width: '100%' }}
                            />
                            <button onClick={handleKeyLogin}>Login with Keys</button>
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </div>
                ) : (
                    <div>
                        <p>Connected Wallet: {wallet.address}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '20px' }}>
                    <li><Link to="/wallet/create">Create Wallet</Link></li>
                    <li><Link to="/wallet/balance">Check Balance</Link></li>
                </ul>
            </nav>
            <Outlet />
        </div>
    );
}

export default Wallet; 