import Mailjet from 'node-mailjet';
import { configDotenv } from 'dotenv';
import generatePasswordMail from './generatePasswordMail.js';

class Mail {
  constructor() {
    configDotenv();
  }

  sendMail(email, name, subject, html) {
    if (!email || !name || !subject || !html) {
      return res.status(400).json({ message: 'Incomplete Data' });
    }

    const mailService = Mailjet.apiConnect(
      process.env.MAIL_APIKEY,
      process.env.MAIL_PRIVATEKEY
    );
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

  sendPasswordmails(users) {
    const mailService = Mailjet.apiConnect(
      process.env.MAIL_APIKEY,
      process.env.MAIL_PRIVATEKEY
    );
    for (const user of users) {
      mailService.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'nsn172002.nazim@gmail.com',
              Name: 'ExamNest',
            },
            To: [
              {
                Email: user.email,
                Name: user.username,
              },
            ],
            Subject: 'ExamNest Student Account Created',
            HTMLPart: generatePasswordMail(
              user.username,
              user.email,
              user.raw_password
            ),
          },
        ],
      });
    }
  }
}

const mail = new Mail();
export default mail;
