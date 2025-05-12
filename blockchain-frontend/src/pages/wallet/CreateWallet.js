import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import Web3 from 'web3';

function CreateWallet({ web3, onWalletCreated }) {
    const navigate = useNavigate();
    const { wallet, setWallet } = useWallet();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        // Calculate password strength
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^A-Za-z0-9]/)) strength += 1;
        setPasswordStrength(strength);
    }, [password]);

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-red-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            case 5: return 'Very Strong';
            default: return '';
        }
    };

    const createWallet = async () => {
        setError('');
        
        if (!password || !confirmPassword) {
            setError('Please enter and confirm your password');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (passwordStrength < 3) {
            setError('Please choose a stronger password');
            return;
        }

        if (wallet?.isLoggedIn) {
            const confirmed = window.confirm(
                "WARNING: Creating a new wallet will override your current wallet. " +
                "Please make sure you have downloaded your current wallet's keystore file first. " +
                "You can download it from the wallet management page. " +
                "Do you want to continue?"
            );
            if (!confirmed) {
                return;
            }
        }

        setIsLoading(true);

        try {
            const web3 = new Web3();
            const account = web3.eth.accounts.create();
            const keystore = await web3.eth.accounts.encrypt(account.privateKey, password);

            const walletData = {
                keystore,
                address: account.address,
                isLoggedIn: true
            };

            setWallet(walletData);
            localStorage.setItem('wallet', JSON.stringify(walletData));

            // Create and download the keystore file
            const element = document.createElement('a');
            const file = new Blob([JSON.stringify(keystore, null, 2)], { type: 'application/json' });
            element.href = URL.createObjectURL(file);
            element.download = `keystore_${account.address.slice(2, 8)}.json`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

            // Show success message and navigate
            alert('Wallet created successfully! Your keystore file has been downloaded. Keep it secure and never share it with anyone.');
            navigate('/wallet/balance');
        } catch (err) {
            console.error('Error creating wallet:', err);
            setError('Failed to create wallet. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Wallet</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-6">
                    {wallet?.isLoggedIn && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Warning: Current Wallet Will Be Overwritten</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>You are currently logged in with a wallet. Creating a new wallet will override your current wallet.</p>
                                        <p className="mt-1">Please make sure to download your current wallet's keystore file from the wallet management page before proceeding.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password (min 8 characters)"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                        {password && (
                            <div className="mt-2">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                    Password strength: {getPasswordStrengthText()}
                                </p>
                                <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                                    <li>At least 8 characters long</li>
                                    <li>Include uppercase and lowercase letters</li>
                                    <li>Include numbers</li>
                                    <li>Include special characters</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Important: Your encrypted keystore file will be downloaded. Keep it secure and never share it with anyone. You will need this file and your password to access your wallet.
                                </p>
                            </div>
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

                    <button
                        onClick={createWallet}
                        disabled={isLoading || passwordStrength < 3}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
                    </button>
                </div>
            </div>
        </div>
    );
}

CreateWallet.propTypes = {
    web3: PropTypes.object,
    onWalletCreated: PropTypes.func
};

CreateWallet.defaultProps = {
    web3: null,
    onWalletCreated: () => {}
};

export default CreateWallet;