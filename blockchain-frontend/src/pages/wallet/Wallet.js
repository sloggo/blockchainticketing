import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { web3Service } from '../../services/web3Service';

function Wallet() {
    const { wallet, setWallet } = useWallet();
    const [error, setError] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('keystore');

    useEffect(() => {
        const savedWallet = localStorage.getItem('wallet');
        if (savedWallet) {
            setWallet(JSON.parse(savedWallet));
        }
    }, [setWallet]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const keystore = JSON.parse(e.target.result);
                
                if (!keystore.address || !keystore.crypto) {
                    throw new Error('Invalid keystore format');
                }

                const password = prompt("Please enter your wallet password:", "");
                if (!password) {
                    throw new Error('Password is required');
                }

                await web3Service.decryptWallet(keystore, password);

                const walletData = { 
                    keystore,
                    address: keystore.address,
                    isLoggedIn: true 
                };
                setWallet(walletData);
                localStorage.setItem('wallet', JSON.stringify(walletData));
            } catch (err) {
                console.error('Error loading keystore:', err);
                setError(err.message || 'Invalid keystore file or password');
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
            setIsLoading(false);
        };

        reader.readAsText(file);
    };

    const handleKeyLogin = async () => {
        if (!publicKey || !privateKey) {
            setError('Please enter both public and private keys');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
            const cleanPublicKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
            
            const account = web3Service.web3.eth.accounts.privateKeyToAccount('0x' + cleanPrivateKey);
            if (account.address.toLowerCase() !== cleanPublicKey.toLowerCase()) {
                throw new Error('Private key does not match the provided public key');
            }

            const password = prompt("Enter a password to encrypt your keys:", "");
            if (!password) {
                throw new Error('Password is required');
            }

            const keystore = await web3Service.web3.eth.accounts.encrypt('0x' + cleanPrivateKey, password);
            const walletData = {
                keystore,
                address: cleanPublicKey.toLowerCase(),
                isLoggedIn: true
            };
            setWallet(walletData);
            localStorage.setItem('wallet', JSON.stringify(walletData));
        } catch (err) {
            console.error('Error logging in with keys:', err);
            setError(err.message || 'Invalid keys');
        } finally {
            setIsLoading(false);
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

    const downloadKeystore = () => {
        if (!wallet?.keystore) {
            setError('No keystore file available');
            return;
        }

        try {
            const element = document.createElement('a');
            const file = new Blob([JSON.stringify(wallet.keystore, null, 2)], { type: 'application/json' });
            element.href = URL.createObjectURL(file);
            element.download = `keystore_${wallet.address.slice(2, 8)}.json`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (err) {
            console.error('Error downloading keystore:', err);
            setError('Failed to download keystore file');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Management</h1>
                
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    {!wallet.isLoggedIn ? (
                        <div className="space-y-6">
                            <div className="flex space-x-4 mb-6">
                                <button
                                    onClick={() => setLoginMethod('keystore')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                                        loginMethod === 'keystore'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Upload Keystore
                                </button>
                                <button
                                    onClick={() => setLoginMethod('keys')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                                        loginMethod === 'keys'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Enter Keys
                                </button>
                            </div>

                            {loginMethod === 'keystore' ? (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Keystore File</h3>
                                    <div className="flex items-center space-x-4">
                                        <input 
                                            type="file" 
                                            accept=".json" 
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="keystore-upload"
                                            disabled={isLoading}
                                        />
                                        <label 
                                            htmlFor="keystore-upload" 
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Loading...' : 'Choose File'}
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Select your encrypted keystore file (.json)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Wallet Keys</h3>
                                    <div>
                                        <label htmlFor="public-key" className="block text-sm font-medium text-gray-700">
                                            Public Key (Address)
                                        </label>
                                        <input
                                            id="public-key"
                                            type="text"
                                            placeholder="0x..."
                                            value={publicKey}
                                            onChange={(e) => setPublicKey(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="private-key" className="block text-sm font-medium text-gray-700">
                                            Private Key
                                        </label>
                                        <input
                                            id="private-key"
                                            type="password"
                                            placeholder="0x... or without 0x"
                                            value={privateKey}
                                            onChange={(e) => setPrivateKey(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleKeyLogin}
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Logging in...' : 'Login with Keys'}
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Connected Wallet</p>
                                    <p className="mt-1 text-lg font-medium text-gray-900">{wallet.address}</p>
                                </div>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={downloadKeystore}
                                        className="px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Download Keystore
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <nav className="mb-8">
                    <ul className="flex space-x-4">
                        <li>
                            <Link 
                                to="/wallet/create"
                                className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Create Wallet
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/wallet/balance"
                                className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Check Balance
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="bg-white shadow rounded-lg p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Wallet; 