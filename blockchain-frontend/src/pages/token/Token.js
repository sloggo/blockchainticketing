import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Token() {
    return (
        <div>
            <h1>Token</h1>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '20px' }}>
                    <li><Link to="/token/buy">Buy Token</Link></li>
                    <li><Link to="/token/transfer">Transfer Token</Link></li>
                </ul>
            </nav>
            <Outlet />
        </div>
    );
}

export default Token; 