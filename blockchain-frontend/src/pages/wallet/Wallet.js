import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Wallet() {
    return (
        <div>
            <h1>Wallet</h1>
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