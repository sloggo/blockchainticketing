import React from 'react';
import { useWallet } from '../../context/WalletContext';

function CreateWallet(props) {
    const { wallet, setWallet } = useWallet();
    const [web3, setWeb3] = React.useState(props.web3);

    const createWallet = () => {
        if (wallet) {
            const confirmed = window.confirm(
                "Creating a new wallet will override your current wallet. Please make sure you have downloaded your current wallet first. Do you want to continue?"
            );
            if (!confirmed) {
                return;
            }
        }
        console.log("Creating wallet...")
        const newWallet = web3.eth.accounts.create();
        const walletData = {
            address: newWallet.address,
            privateKey: newWallet.privateKey
        };
        setWallet(walletData);
        console.log("Wallet created:", walletData);
    }

    const downloadWallet = () => {
        if (!wallet) return;
        
        const dataStr = JSON.stringify(wallet, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wallet_${wallet.address.slice(0, 8)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    
    return (
        <div>
            <h2>Create Wallet</h2>
            <button onClick={createWallet}>Create Wallet</button>
            {wallet && (
                <div>
                    <p>Wallet Address: {wallet.address}</p>
                    <p>Private Key: {wallet.privateKey}</p>
                    <button onClick={downloadWallet}>Download Wallet</button>
                </div>
            )}
        </div>
    );
}

export default CreateWallet;