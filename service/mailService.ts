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
                <img src="${process.env.SITEURL}/backend/uploads/logo.png" alt="Логотип" style="width:100px;height:100px"/>
                <p><b>Для продолжения регистрации в приложении <a href='${process.env.SITEURL}'>расписания АТК ДГТУ</a> необходимо подтвердить адресс электронной почты</b></p>
                <a href=${link} style="padding:10px;color:#fff;background-color:green;font-size:30px;text-decoration:none;border-radius:3px">Подтвердить</a>
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
