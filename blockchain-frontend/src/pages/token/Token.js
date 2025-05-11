import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Token() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Token Operations</h1>
                <nav className="mb-8">
                    <ul className="flex space-x-4">
                        <li>
                            <Link 
                                to="/token/buy"
                                className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Buy Tokens
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/token/transfer"
                                className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Sell Tokens
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

export default Token; 