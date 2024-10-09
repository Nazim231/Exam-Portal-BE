import Mailjet from 'node-mailjet';
import { configDotenv } from 'dotenv';

class Mail {
    constructor() {
        configDotenv();
    }

    sendMail(email, name, subject, html) {
        if (!email || !name || !subject || !html) {
            return res.status(400).json({ message: 'Incomplete Data' });
        }

        const mailService = Mailjet.apiConnect(process.env.MAIL_APIKEY, process.env.MAIL_PRIVATEKEY);
        mailService.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'nsn172002.nazim@gmail.com',
                        Name: 'ExamNest',
                    },
                    To: [
                        {
                            Email: email,
                            Name: name,
                        },
                    ],
                    Subject: subject,
                    HTMLPart: html,
                },
            ],
        });
    }
}

const mail = new Mail();
export default mail;
