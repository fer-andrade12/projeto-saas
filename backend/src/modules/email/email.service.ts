import { Injectable } from '@nestjs/common'
// @ts-ignore
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private transporter: any

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const secure = process.env.SMTP_SECURE === 'true'
    const user = process.env.SMTP_USER || ''
    const pass = process.env.SMTP_PASS || ''

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    })
  }

  async sendCampaignEmail(input: {
    to: string
    subject: string
    html: string
    from?: string
  }) {
    const from = input.from || process.env.SMTP_FROM || 'noreply@saas-campaign.com'
    try {
      const result = await this.transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      })
      return { success: true, messageId: result.messageId }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Email send error:', error)
      return { success: false, error: message }
    }
  }

  buildCampaignEmailHtml(input: {
    message: string
    clickUrl: string
    openUrl: string
    imageUrl?: string
  }): string {
    const { message, clickUrl, openUrl, imageUrl } = input
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${imageUrl ? `<img src="${imageUrl}" alt="Campaign" style="max-width: 100%; height: auto; margin-bottom: 20px;">` : ''}
        <div style="margin-bottom: 30px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <a href="${clickUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Clique Aqui
        </a>
        <img src="${openUrl}" alt="" width="1" height="1" style="display: block; margin-top: 20px;">
      </body>
      </html>
    `
  }
}
