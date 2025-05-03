import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { formatAddress, formatPrivateKey } from '../../utils/formatAddress';

function CreateWallet(props) {
    const { wallet, setWallet } = useWallet();
    const [web3, setWeb3] = React.useState(props.web3);

    const createWallet = async () => {
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
        
        const password = window.prompt("Enter a password to encrypt your wallet:");
        if (!password) return;

        try {
            const keystore = await web3.eth.accounts.encrypt(newWallet.privateKey, password);
            setWallet({
                address: formatAddress(newWallet.address),
                keystore: keystore,
                isLoggedIn: true
            });
            console.log("Wallet created and encrypted");
        } catch (error) {
            console.error("Error creating wallet:", error);
            window.alert("Error creating wallet. Please try again.");
        }
    }

    const downloadWallet = () => {
        if (!wallet || !wallet.keystore) return;
        
        const dataStr = JSON.stringify(wallet.keystore, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `keystore_${formatAddress(wallet.address).slice(0, 8)}.json`;
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
                    <p>Wallet Address: {formatAddress(wallet.address)}</p>
                    <button onClick={downloadWallet}>Download Keystore</button>
                </div>
            )}
        </div>
    );
}

export default CreateWallet;