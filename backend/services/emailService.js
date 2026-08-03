/**
 * emailService.js
 * ─────────────────────────────────────────────────────────────────────
 * Nodemailer-based email service using Gmail SMTP.
 * All config is read from environment variables — nothing hardcoded.
 *
 * Usage:
 *   const { sendPasswordResetEmail } = require('./emailService');
 *   await sendPasswordResetEmail({ to, name, resetUrl });
 */

const nodemailer = require('nodemailer');

/**
 * Build and return a reusable transporter.
 * Throws clearly if EMAIL_USER or EMAIL_PASS are missing.
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      'EMAIL_USER and EMAIL_PASS must be set in .env to send emails. ' +
      'For Gmail, use an App Password — not your account password.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

/**
 * Send a password reset email.
 *
 * @param {object} options
 * @param {string} options.to       — recipient email address
 * @param {string} options.name     — recipient's display name
 * @param {string} options.resetUrl — full reset link with token
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = createTransporter();

  const fromAddress = `"SkillSync AI" <${process.env.EMAIL_USER}>`;
  const expiryText = '1 hour';

  const mailOptions = {
    from: fromAddress,
    to,
    subject: '🔐 SkillSync AI — Password Reset Request',
    // Plain-text fallback for clients that don't render HTML
    text: [
      `Hi ${name},`,
      '',
      'You requested a password reset for your SkillSync AI account.',
      '',
      'Click the link below to reset your password. This link expires in 1 hour.',
      '',
      resetUrl,
      '',
      'If you did not request this, you can safely ignore this email.',
      '',
      '— The SkillSync AI Team'
    ].join('\n'),

    // Rich HTML email — matches the SkillSync dark theme
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset — SkillSync AI</title>
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(15,23,42,0.95),rgba(8,14,30,0.98));border:1px solid rgba(99,102,241,0.2);border-radius:24px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="display:inline-block;width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:10px;text-align:center;line-height:36px;font-size:18px;">⚡</span>
                      <span style="font-size:1.1rem;font-weight:800;color:#f8fafc;letter-spacing:-0.02em;">SkillSync <span style="background:linear-gradient(135deg,#818cf8,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">AI</span></span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.2);border-radius:99px;padding:4px 12px;font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Security Alert</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <!-- Lock icon -->
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;width:72px;height:72px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:50%;text-align:center;line-height:72px;font-size:32px;">🔐</div>
              </div>

              <h1 style="color:#f8fafc;font-size:1.5rem;font-weight:900;text-align:center;margin:0 0 8px;letter-spacing:-0.02em;">Password Reset Request</h1>
              <p style="color:#94a3b8;font-size:0.95rem;text-align:center;margin:0 0 32px;line-height:1.6;">
                Hi <strong style="color:#f8fafc;">${name}</strong>, we received a request to reset your SkillSync AI account password.
              </p>

              <!-- Reset Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#ffffff;text-decoration:none;font-weight:800;font-size:0.95rem;padding:16px 40px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 4px 20px rgba(99,102,241,0.35);">
                  Reset My Password
                </a>
              </div>

              <!-- Expiry notice -->
              <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:14px 18px;margin-bottom:28px;text-align:center;">
                <p style="color:#f59e0b;font-size:0.8rem;font-weight:700;margin:0;">
                  ⏱ This link expires in <strong>${expiryText}</strong>
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="color:#64748b;font-size:0.78rem;text-align:center;margin:0 0 8px;line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="text-align:center;margin:0 0 28px;">
                <a href="${resetUrl}" style="color:#818cf8;font-size:0.75rem;word-break:break-all;text-decoration:none;">${resetUrl}</a>
              </p>

              <!-- Security note -->
              <div style="background:rgba(244,63,94,0.05);border:1px solid rgba(244,63,94,0.15);border-radius:12px;padding:14px 18px;">
                <p style="color:#94a3b8;font-size:0.78rem;margin:0;line-height:1.6;">
                  <strong style="color:#f8fafc;">Didn't request this?</strong> You can safely ignore this email. Your password will remain unchanged. If you're concerned, consider changing your password after logging in.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="color:#334155;font-size:0.72rem;margin:0;line-height:1.6;">
                © ${new Date().getFullYear()} SkillSync AI &nbsp;•&nbsp; This email was sent to <a href="mailto:${to}" style="color:#475569;text-decoration:none;">${to}</a><br/>
                This is an automated message — please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✓ Password reset email sent to ${to} — MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] ✗ Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendPasswordResetEmail };
