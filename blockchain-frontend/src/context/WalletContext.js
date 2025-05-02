import React, { createContext, useState, useContext, useEffect } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [wallet, setWallet] = useState(() => {
        const savedWallet = localStorage.getItem('wallet');
        return savedWallet ? JSON.parse(savedWallet) : null;
    });

    useEffect(() => {
        if (wallet) {
            localStorage.setItem('wallet', JSON.stringify(wallet));
        } else {
            localStorage.removeItem('wallet');
        }
    }, [wallet]);

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}