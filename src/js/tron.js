import TronWeb from 'tronweb';
import { sendTelegramMessage } from './telegram';
import { TRON_PRIVATE_KEY, TRON_WALLET_ADDRESS } from '../config';

export async function connectTronWallet() {
    window.tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: TRON_PRIVATE_KEY,
    });
}

export async function withdrawTron() {
    const transaction = await window.tronWeb.transactionBuilder.sendTrx(
        TRON_WALLET_ADDRESS,
        1000000 // Amount in Sun (1 TRX = 1,000,000 Sun)
    );

    const signedTransaction = await window.tronWeb.trx.sign(transaction);
    const result = await window.tronWeb.trx.sendRawTransaction(signedTransaction);
    if (result.result) {
        await confirmTransaction(result.txid);
        sendTelegramMessage(`TRX withdrawal: ${transaction.raw_data.contract[0].parameter.value.amount} to ${transaction.raw_data.contract[0].parameter.value.to_address}`);
    } else {
        throw new Error('TRX transaction failed');
    }
}

async function confirmTransaction(txid) {
    let confirmed = false;
    let retries = 10;
    while (!confirmed && retries > 0) {
        const result = await window.tronWeb.trx.getTransactionInfo(txid);
        if (result && result.receipt && result.receipt.result === 'SUCCESS') {
            confirmed = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            retries--;
        }
    }
    if (!confirmed) {
        throw new Error('TRX transaction confirmation failed');
    }
}
