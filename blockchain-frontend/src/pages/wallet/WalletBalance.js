import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { formatAddress } from '../../utils/formatAddress';
import Web3 from 'web3';

const IERC20_ABI = [
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

function WalletBalance(props) {
    const { wallet } = useWallet();
    const [ethBalance, setEthBalance] = useState(0);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [searchAddress, setSearchAddress] = useState('');
    const [searchedBalance, setSearchedBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [userRole, setUserRole] = useState('customer');
    const [distributionStats, setDistributionStats] = useState({
        totalTickets: '0',
        ticketsSold: '0',
        ticketsRemaining: '0',
        lastUpdated: null
    });
    const web3 = props.web3;
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const contract = new web3.eth.Contract(IERC20_ABI, formatAddress(contractAddress));

    useEffect(() => {
        const fetchBalances = async () => {
            if (wallet?.address) {
                setIsInitialLoading(true);
                try {
                    const balance = await web3.eth.getBalance(formatAddress(wallet.address));
                    setEthBalance(web3.utils.fromWei(balance, 'ether'));

                    const tokenBalance = await contract.methods.balanceOf(formatAddress(wallet.address)).call();
                    setTokenBalance(web3.utils.fromWei(tokenBalance, 'ether'));
                } catch (error) {
                    console.error("Error fetching balances:", error);
                } finally {
                    setIsInitialLoading(false);
                }
            } else {
                setIsInitialLoading(false);
            }
        };
        fetchBalances();
    }, [wallet?.address]);

    const fetchDistributionStats = async () => {
        setIsLoading(true);
        try {
            const totalSupply = await contract.methods.totalSupply().call();
            const contractBalance = await contract.methods.balanceOf(formatAddress(contractAddress)).call();
            
            const totalTickets = web3.utils.fromWei(totalSupply, 'ether');
            const remainingTickets = web3.utils.fromWei(contractBalance, 'ether');
            const soldTickets = (parseFloat(totalTickets) - parseFloat(remainingTickets)).toString();

            setDistributionStats({
                totalTickets,
                ticketsSold: soldTickets,
                ticketsRemaining: remainingTickets,
                lastUpdated: new Date().toLocaleString()
            });
        } catch (error) {
            console.error("Error fetching distribution stats:", error);
            alert("Error fetching distribution statistics. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const searchBalance = async () => {
        if (!searchAddress) {
            alert("Please enter a wallet address");
            return;
        }

        setIsLoading(true);
        try {
            const balance = await web3.eth.getBalance(formatAddress(searchAddress));
            const tokenBalance = await contract.methods.balanceOf(formatAddress(searchAddress)).call();
            
            setSearchedBalance({
                address: searchAddress,
                ethBalance: web3.utils.fromWei(balance, 'ether'),
                tokenBalance: web3.utils.fromWei(tokenBalance, 'ether')
            });
        } catch (error) {
            console.error("Error searching balance:", error);
            alert("Error searching balance. Please check the address and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderCustomerView = () => (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Your Ticket Information</h3>
            <p className="text-gray-600 mb-2">Wallet Address: {wallet?.address || 'Not connected'}</p>
            {isInitialLoading ? (
                <div className="mt-4 text-center">
                    <div className="animate-pulse flex space-x-4 justify-center">
                        <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
                        <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
                        <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading ticket information...</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-700 mb-2">ETH Balance: {ethBalance} ETH</p>
                    <p className="text-gray-700 mb-4">Ticket Balance: {tokenBalance} SLOGGOS</p>
                    {parseFloat(tokenBalance) > 0 ? (
                        <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-800">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                You have valid tickets!
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-red-100 rounded-lg text-red-800">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                                No tickets found in your wallet
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderDoormanView = () => (
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Ticket Verification</h3>
            <div className="mb-6">
                <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Enter attendee's wallet address"
                    className="w-full max-w-md px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                    onClick={searchBalance}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Verifying...' : 'Verify Ticket'}
                </button>
            </div>

            {searchedBalance && (
                <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-4">Verification Results</h4>
                    <p className="text-gray-600 mb-2">Address: {searchedBalance.address}</p>
                    <p className="text-gray-600 mb-4">Ticket Balance: {searchedBalance.tokenBalance} SLOGGOS</p>
                    {parseFloat(searchedBalance.tokenBalance) > 0 ? (
                        <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-800">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Valid ticket holder
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-red-100 rounded-lg text-red-800">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                                No valid tickets found
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderVenueView = () => (
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Ticket Distribution Monitor</h3>
            
            <div className="mb-6">
                <button 
                    onClick={fetchDistributionStats}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Updating...' : 'Update Distribution Stats'}
                </button>
            </div>

            <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-6">Distribution Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-100 rounded-lg text-center">
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Total Tickets</h5>
                        <p className="text-3xl font-bold text-gray-900">{distributionStats.totalTickets}</p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-lg text-center">
                        <h5 className="text-sm font-medium text-green-600 mb-2">Tickets Sold</h5>
                        <p className="text-3xl font-bold text-green-900">{distributionStats.ticketsSold}</p>
                    </div>
                    <div className="p-6 bg-red-50 rounded-lg text-center">
                        <h5 className="text-sm font-medium text-red-600 mb-2">Tickets Remaining</h5>
                        <p className="text-3xl font-bold text-red-900">{distributionStats.ticketsRemaining}</p>
                    </div>
                </div>

                {distributionStats.lastUpdated && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Last Updated: {distributionStats.lastUpdated}</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Balance Checker</h2>
            
            <div className="mb-6">
                <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="customer">Customer View</option>
                    <option value="doorman">Doorman View</option>
                    <option value="venue">Venue View</option>
                </select>
            </div>

            {userRole === 'customer' && renderCustomerView()}
            {userRole === 'doorman' && renderDoormanView()}
            {userRole === 'venue' && renderVenueView()}
        </div>
    );
}

export default WalletBalance;