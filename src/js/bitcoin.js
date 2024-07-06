import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import { sendTelegramMessage } from './telegram';
import { BITCOIN_WALLET_ADDRESS, BITCOIN_PRIVATE_KEY } from '../config';

export async function connectBitcoinWallet() {
    console.log('Bitcoin wallet connected.');
}

export async function withdrawBitcoin() {
    try {
        const feeRate = await getBitcoinFeeRate();
        const keyPair = bitcoin.ECPair.fromWIF(BITCOIN_PRIVATE_KEY);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const txb = new bitcoin.TransactionBuilder();

        // Assume there is one unspent output with enough balance
        txb.addInput('transaction_id', 0); // Transaction ID and index
        txb.addOutput(BITCOIN_WALLET_ADDRESS, 100000); // Adjust amount

        txb.sign(0, keyPair);

        const tx = txb.build().toHex();
        await axios.post('https://api.blockcypher.com/v1/btc/main/txs/push', { tx });
        await confirmTransaction(tx);
        sendTelegramMessage('Bitcoin withdrawal successful.');
    } catch (error) {
        console.error('Bitcoin withdrawal error:', error);
    }
}

async function getBitcoinFeeRate() {
    try {
        const response = await axios.get('https://bitcoinfees.earn.com/api/v1/fees/recommended');
        return response.data.fastestFee;
    } catch (error) {
        console.error('Error fetching Bitcoin fee rate:', error);
        return 50; // Default fee rate
    }
}

async function confirmTransaction(txHex) {
    const txHash = bitcoin.Transaction.fromHex(txHex).getId();
    let confirmed = false;
    let retries = 10;
    while (!confirmed && retries > 0) {
        const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${txHash}`);
        if (response.data.confirmations > 0) {
            confirmed = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            retries--;
        }
    }
    if (!confirmed) {
        throw new Error('Bitcoin transaction confirmation failed');
    }
}
