import { Resend } from 'resend';
import dotenv from 'dotenv';
import { resetPasswordTemplate, verifyEmailTemplate } from './emailTemplates';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (email: string, link: string) => {
  try {
    await resend.emails.send({
      from: '"support service" <services17@sistemadeservicios.shop>',
      to: email,
      subject: 'Verify your email',
      html: verifyEmailTemplate(link),
    });
  } catch (err) {
    console.error('Error al verify email', err);
    throw err;
  }
};

export const sendResetPasswordEmail = async (email: string, name: string, link: string) => {
  try {
    await resend.emails.send({
      from: '"support service" <services17@sistemadeservicios.shop>',
      to: email,
      subject: 'Reset your password',
      html: resetPasswordTemplate(name, link),
    });
  } catch (err) {
    console.log('error al resetear password', err);
    throw err;
  }
};

export default resend;