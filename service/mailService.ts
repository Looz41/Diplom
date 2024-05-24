const nodemailer = require('nodemailer');
require('dotenv').config();

class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.GMAILADDRESS,
                pass: process.env.GMAILPASS,
            }
        });
    }

    async sendActivationMail(to: string, link: string) {
        const mailOptions = {
            from: process.env.GMAILADDRESS,
            to,
            subject: 'Код подтверждения регистрации',
            html: `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Подтверждение регистрации</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #4CAF50;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                    }
                    .header img {
                        max-width: 100px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                    }
                    .content h1 {
                        color: #333333;
                    }
                    .content p {
                        color: #666666;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        padding: 15px 25px;
                        margin: 20px 0;
                        color: #ffffff;
                        background-color: #4CAF50;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #666666;
                        text-align: center;
                        padding: 10px;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <img src="${process.env.SITEURL}/backend/uploads/logo.png" alt="Логотип">
                    </div>
                    <div class="content">
                        <h1>Добро пожаловать!</h1>
                        <p>Спасибо за регистрацию. Пожалуйста, подтвердите ваш аккаунт, нажав на кнопку ниже.</p>
                        <a href="${link}" class="button">Подтвердить</a>
                    </div>
                    <div class="footer">
                        <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Error sending email');
        }
    }
}

module.exports = new MailService();
