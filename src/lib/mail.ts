import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Admaniacs Finance" <noreply@admaniacs.io>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested a password reset for your Admaniacs Finance account. Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #6b7280;">${resetLink}</p>
      </div>
    `,
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials missing. Email not sent. Reset Link:', resetLink)
    return { success: true, mocked: true, link: resetLink }
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send reset email')
  }
}
