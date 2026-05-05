
export const verifyEmailTemplate = (link: string): string => `
  <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#fff;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#0d0e1a;border-radius:16px;overflow:hidden;border:1px solid #4b4e6b4f;">
            <div style="padding:40px 36px 10px 36px;">
              <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">Verify your email</h1>
              <p style="color:#64748b;font-size:17px;margin:0 0 32px;line-height:1.6;">
                Click the button below to confirm your email address and get started.
              </p>
              <a href="${link}" style="display:inline-block;padding:14px 32px;background:linear-gradient(120deg,#407ddf,#7453d6);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">
                Verify Email
              </a>
              <p style="color:#9295b1c0;font-size:13px;margin:32px 0 0;line-height:1.6;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div style="padding:20px 36px;border-top:1px solid #4b4e6b4f;">
              <p style="color:#9295b1c0;font-size:12px;margin:0;text-align:center;">
                © 2025 GOLINX · All rights reserved
              </p>
            </div>
          </div>
        </body>
      </html>
  `;

export const resetPasswordTemplate = (name: string, link: string): string => `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#fff;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#0d0e1a;border-radius:16px;overflow:hidden;border:1px solid #4b4e6b4f;">
        <div style="padding:40px 36px;">
          <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">Hello ${name} 👋</h1>
          <p style="color:#64748b;font-size:17px;margin:0 0 32px;line-height:1.6;">
            We received a request to reset your password. Click the button below to create a new one.
          </p>
          <a href="${link}" style="display:inline-block;padding:14px 32px;background:linear-gradient(120deg,#407ddf,#7453d6);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#9295b1c0;font-size:13px;margin:32px 0 0;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email. Your current password will remain unchanged.
          </p>
        </div>
        <div style="padding:20px 36px;border-top:1px solid #4b4e6b4f;">
          <p style="color:#9295b1c0;font-size:12px;margin:0;text-align:center;">
            © 2025 GOLINX · All rights reserved
          </p>
        </div>
      </div>
    </body>
  </html>
`;