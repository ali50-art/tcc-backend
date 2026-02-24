import nodemailer from 'nodemailer';
import { ErrorHandler } from './errorHandler';
import { HttpCode } from './httpCode';
import logger from './logger';

export const sendMail = (email: string, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASS,
    },
  });

  const mailOptions = {
    from: `"TCC CenterDesk" <${process.env.MAILER_EMAIL}>`, // Display name + email
    to: email,
    subject: subject,
    html: body,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      logger.info('Email sent successfully');
    })
    .catch((err) => {
      logger.error('Email sending error:', err);
      throw new ErrorHandler('Mail not delivered!', HttpCode.BAD_REQUEST);
    });
};