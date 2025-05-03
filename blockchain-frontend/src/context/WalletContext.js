import React, { createContext, useState, useContext } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [wallet, setWallet] = useState({
        keystore: null,
        address: null,
        isLoggedIn: false
    });

    const value = {
        wallet,
        setWallet
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}