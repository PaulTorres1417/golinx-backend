import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (email, link) => {
  try {
    await resend.emails.send({
      from: '"support service" <services17@sistemadeservicios.shop>',
      to: email,
      subject: 'verify your email',
      html: `<html>
              <body>
                <h1>Verify your email</h1>
                <p>Haga clic en el enlace a continuación para verificar su dirección de correo electrónico:</p>
                <a href=${link}>Verificar Email</a>
              </body>
            </html>
            `,
    })
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export const sendResetPasswordEmail = async (email, name, link) => {
  try {
    await resend.emails.send({
      from: '"support service" <services17@sistemadeservicios.shop>',
      to: email,
      subject: 'Reset your password',
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333;">Hello ${name} 👋</h2>
              <p style="font-size: 16px; color: #555;">
                Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="padding: 12px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="font-size: 14px; color: #999;">
                Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá siendo válida.
              </p>
              <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #ccc; text-align: center;">
                © 2025 Sistema de Servicios. Todos los derechos reservados.
              </p>
            </div>
            `,
    })
  } catch (error) {
    console.error('Error reset email:', error);
    throw error;
  }
}

export default resend;