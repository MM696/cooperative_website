import nodemailer from 'nodemailer'

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT || 587)

  if (!host || !user || !pass) {
    return { success: false, error: 'SMTP is not configured' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })

    return { success: true, data: info }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error }
  }
}

export function generateContributionEmail(
  memberName: string,
  amount: number,
  datePaid: string,
  totalContributions: number
) {
  return {
    subject: 'Contribution Recorded - Cooperative Management',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Contribution Update</h2>
        <p>Dear ${memberName},</p>
        <p>Your contribution has been successfully recorded:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Contribution Details</h3>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Date Paid:</strong> ${new Date(datePaid).toLocaleDateString()}</p>
          <p><strong>Total Contributions:</strong> $${totalContributions.toFixed(2)}</p>
        </div>
        
        <p>Thank you for your continued support of our cooperative!</p>
        <p>Best regards,<br>The Management Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  }
}
