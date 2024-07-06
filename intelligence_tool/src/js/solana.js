import solanaWeb3 from '@solana/web3.js';
import { sendTelegramMessage } from './telegram';
import { SOLANA_PRIVATE_KEY, SOLANA_WALLET_ADDRESS } from '../config';

let connection;
let wallet;

export async function connectSolanaWallet() {
    try {
        connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
        const keyPair = solanaWeb3.Keypair.fromSecretKey(Buffer.from(SOLANA_PRIVATE_KEY, 'hex'));
        wallet = new solanaWeb3.Wallet(keyPair);
        console.log('Solana wallet connected.');
    } catch (error) {
        console.error('Solana connection error:', error);
    }
}

export async function withdrawSolana() {
    try {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new solanaWeb3.PublicKey(SOLANA_WALLET_ADDRESS),
                lamports: solanaWeb3.LAMPORTS_PER_SOL, // Adjust amount
            })
        );
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);
        await confirmTransaction(signature);
        sendTelegramMessage('Solana withdrawal successful.');
    } catch (error) {
        console.error('Solana withdrawal error:', error);
    }
}

async function confirmTransaction(signature) {
    let confirmed = false;
    let retries = 10;
    while (!confirmed && retries > 0) {
        const response = await connection.getTransaction(signature);
        if (response && response.meta && response.meta.status === 'Success') {
            confirmed = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            retries--;
        }
    }
    if (!confirmed) {
        throw new Error('Solana transaction confirmation failed');
    }
}
