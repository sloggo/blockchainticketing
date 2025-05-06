import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Token() {
    return (
        <div>
            <h1>Token Operations</h1>
            <nav>
                <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    display: 'flex', 
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <li>
                        <Link to="/token/buy" style={{
                            textDecoration: 'none',
                            color: '#007bff',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: '1px solid #007bff'
                        }}>
                            Buy Tokens
                        </Link>
                    </li>
                    <li>
                        <Link to="/token/transfer" style={{
                            textDecoration: 'none',
                            color: '#007bff',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: '1px solid #007bff'
                        }}>
                            Sell Tokens
                        </Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
        </div>
    );
}

export default Token; 