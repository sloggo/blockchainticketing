import Web3 from 'web3';

class Web3Service {
    constructor() {
        this.web3 = new Web3();
    }

    async createWallet(password) {
        try {
            const account = this.web3.eth.accounts.create();
            const keystore = await this.web3.eth.accounts.encrypt(account.privateKey, password);
            return {
                account,
                keystore
            };
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw new Error('Failed to create wallet');
        }
    }

    async decryptWallet(keystore, password) {
        try {
            const account = await this.web3.eth.accounts.decrypt(keystore, password);
            return account;
        } catch (error) {
            console.error('Error decrypting wallet:', error);
            throw new Error('Failed to decrypt wallet');
        }
    }

    async getBalance(address) {
        try {
            const balance = await this.web3.eth.getBalance(address);
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error('Error getting balance:', error);
            throw new Error('Failed to get balance');
        }
    }

    async isConnected() {
        try {
            return await this.web3.eth.net.isListening();
        } catch (error) {
            console.error('Error checking connection:', error);
            return false;
        }
    }
}

export const web3Service = new Web3Service(); 