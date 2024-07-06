import axios from 'axios';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../config';

export async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
    };

    try {
        await axios.post(url, data);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}
