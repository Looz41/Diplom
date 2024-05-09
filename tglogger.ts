import winston from 'winston';
import TelegramTransport from 'winston-telegram';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new TelegramTransport({
            token: '6300901059:AAG27dcxN7x-ospHS5H0sbinyvCTQQESUyw',
            chatId: 1987736097,
        })
    ],
});

export default logger;
