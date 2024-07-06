import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import { sendTelegramMessage } from './telegram';
import { DOGECOIN_WALLET_ADDRESS, DOGECOIN_PRIVATE_KEY } from '../config';

export async function connectDogecoinWallet() {
    console.log('Dogecoin wallet connected.');
}

export async function withdrawDogecoin() {
    try {
        const feeRate = await getDogecoinFeeRate();
        const keyPair = bitcoin.ECPair.fromWIF(DOGECOIN_PRIVATE_KEY);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const txb = new bitcoin.TransactionBuilder();

        // Assume there is one unspent output with enough balance
        txb.addInput('transaction_id', 0); // Transaction ID and index
        txb.addOutput(DOGECOIN_WALLET_ADDRESS, 1000000); // Adjust amount

        txb.sign(0, keyPair);

        const tx = txb.build().toHex();
        await axios.post('https://sochain.com/api/v2/send_tx/DOGE', { tx_hex: tx });
        await confirmTransaction(tx);
        sendTelegramMessage('Dogecoin withdrawal successful.');
    } catch (error) {
        console.error('Dogecoin withdrawal error:', error);
    }
}

async function getDogecoinFeeRate() {
    try {
        const response = await axios.get('https://sochain.com/api/v2/get_info/DOGE');
        return response.data.data.difficulty; // Placeholder for fee rate
    } catch (error) {
        console.error('Error fetching Dogecoin fee rate:', error);
        return 1; // Default fee rate
    }
}

async function confirmTransaction(txHex) {
    const txHash = bitcoin.Transaction.fromHex(txHex).getId();
    let confirmed = false;
    let retries = 10;
    while (!confirmed && retries > 0) {
        const response = await axios.get(`https://sochain.com/api/v2/tx/DOGE/${txHash}`);
        if (response.data.data.confirmations > 0) {
            confirmed = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            retries--;
        }
    }
    if (!confirmed) {
        throw new Error('Dogecoin transaction confirmation failed');
    }
}
