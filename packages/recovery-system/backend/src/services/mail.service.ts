import fs from 'fs';
import path from 'path';
import nodemailer, { SendMailOptions } from 'nodemailer';

const RELIFE_MAIL_FROM = process.env.MAIL_FROM || 'reliferecovery247@gmail.com';
const RELIFE_MAIL_USER = process.env.MAIL_USER || 'reliferecovery247@gmail.com';
const RELIFE_MAIL_APP_PASSWORD = process.env.MAIL_APP_PASSWORD || '';
const RELIFE_LOGO_URL = process.env.MAIL_LOGO_URL || '';

type BookingEmailPayload = {
  to: string;
  userName?: string;
  counselorName: string;
  slotStart: Date;
  slotEnd: Date;
  fee: number;
  bookingId: string;
  notes?: string;
  reason?: string;
};

class MailService {
  private transporter = RELIFE_MAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: RELIFE_MAIL_USER,
          pass: RELIFE_MAIL_APP_PASSWORD,
        },
      })
    : null;

  private getLogoAsset() {
    if (RELIFE_LOGO_URL) {
      return {
        src: RELIFE_LOGO_URL,
        cid: null as string | null,
        attachments: [] as NonNullable<SendMailOptions['attachments']>,
      };
    }

    const logoPath = path.resolve(__dirname, '../../../frontend/public/images/logo.svg');
    if (fs.existsSync(logoPath)) {
      return {
        src: 'cid:relife-logo',
        cid: 'relife-logo',
        attachments: [
          {
            filename: 'logo.svg',
            path: logoPath,
            cid: 'relife-logo',
          },
        ] as NonNullable<SendMailOptions['attachments']>,
      };
    }

    return {
      src: '',
      cid: null as string | null,
      attachments: [] as NonNullable<SendMailOptions['attachments']>,
    };
  }

  private isConfigured() {
    return !!this.transporter;
  }

  private renderLayout(title: string, intro: string, rows: Array<{ label: string; value: string }>, footer: string) {
    const logo = this.getLogoAsset();
    const logoBlock = logo.src
      ? `<img src="${logo.src}" alt="ReLife" style="height:40px;display:block;margin:0 auto 12px auto;" />`
      : `<div style="font-size:26px;font-weight:800;color:#0f5132;text-align:center;margin-bottom:12px;">ReLife</div>`;

    const rowHtml = rows
      .map(
        (r) =>
          `<tr><td style="padding:10px 12px;border-bottom:1px solid #edf2f7;font-weight:600;color:#1f2937;">${r.label}</td><td style="padding:10px 12px;border-bottom:1px solid #edf2f7;color:#111827;">${r.value}</td></tr>`
      )
      .join('');

    const html = `
      <div style="background:#f4faf7;padding:24px 10px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d9eee2;">
          <tr>
            <td style="background:linear-gradient(135deg,#d9f6e7,#effbf4);padding:24px;">
              ${logoBlock}
              <h2 style="margin:0;text-align:center;color:#0f5132;font-size:22px;">${title}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 10px 24px;color:#374151;font-size:15px;line-height:1.6;">
              ${intro}
            </td>
          </tr>
          <tr>
            <td style="padding:6px 24px 20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                ${rowHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px 24px;color:#4b5563;font-size:14px;line-height:1.6;">
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px;background:#f8fafc;color:#6b7280;font-size:12px;text-align:center;">
              ReLife Recovery Support
            </td>
          </tr>
        </table>
      </div>
    `;

    return { html, attachments: logo.attachments };
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    text: string,
    attachments: NonNullable<SendMailOptions['attachments']> = []
  ) {
    if (!this.isConfigured()) {
      console.warn('[MailService] MAIL_APP_PASSWORD not set. Skipping email send.');
      return;
    }

    await this.transporter!.sendMail({
      from: `ReLife Recovery <${RELIFE_MAIL_FROM}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
  }

  async sendBookingCreatedEmail(payload: BookingEmailPayload) {
    const start = payload.slotStart.toLocaleString();
    const end = payload.slotEnd.toLocaleString();
    const subject = 'ReLife Booking Confirmation';

    const text = `Hello${payload.userName ? ` ${payload.userName}` : ''},\n\nYour counseling session has been booked successfully.\nCounselor: ${payload.counselorName}\nStart: ${start}\nEnd: ${end}\nFee: $${payload.fee}\nBooking ID: ${payload.bookingId}\n${payload.notes ? `Notes: ${payload.notes}\n` : ''}\nThank you for choosing ReLife.`;

    const content = this.renderLayout(
      'Booking Confirmed',
      `Hello${payload.userName ? ` ${payload.userName}` : ''},<br/>Your counseling session has been booked successfully.`,
      [
        { label: 'Counselor', value: payload.counselorName },
        { label: 'Start', value: start },
        { label: 'End', value: end },
        { label: 'Fee', value: `$${payload.fee}` },
        { label: 'Booking ID', value: payload.bookingId },
        ...(payload.notes ? [{ label: 'Notes', value: payload.notes }] : []),
      ],
      'Thank you for choosing ReLife. We are here for your recovery journey.'
    );

    await this.sendMail(payload.to, subject, content.html, text, content.attachments);
  }

  async sendBookingCancelledEmail(payload: BookingEmailPayload) {
    const start = payload.slotStart.toLocaleString();
    const end = payload.slotEnd.toLocaleString();
    const subject = 'ReLife Booking Cancelled';

    const text = `Hello${payload.userName ? ` ${payload.userName}` : ''},\n\nYour counseling session has been cancelled.\nCounselor: ${payload.counselorName}\nStart: ${start}\nEnd: ${end}\nBooking ID: ${payload.bookingId}\n${payload.reason ? `Reason: ${payload.reason}\n` : ''}\nIf this was not expected, contact support.`;

    const content = this.renderLayout(
      'Booking Cancelled',
      `Hello${payload.userName ? ` ${payload.userName}` : ''},<br/>Your counseling session has been cancelled.`,
      [
        { label: 'Counselor', value: payload.counselorName },
        { label: 'Start', value: start },
        { label: 'End', value: end },
        { label: 'Booking ID', value: payload.bookingId },
        ...(payload.reason ? [{ label: 'Reason', value: payload.reason }] : []),
      ],
      'If this was not expected, please contact support immediately.'
    );

    await this.sendMail(payload.to, subject, content.html, text, content.attachments);
  }

  async sendBookingRescheduledEmail(payload: BookingEmailPayload) {
    const start = payload.slotStart.toLocaleString();
    const end = payload.slotEnd.toLocaleString();
    const subject = 'ReLife Booking Rescheduled';

    const text = `Hello${payload.userName ? ` ${payload.userName}` : ''},\n\nYour counseling session has been rescheduled.\nCounselor: ${payload.counselorName}\nNew Start: ${start}\nNew End: ${end}\nFee: $${payload.fee}\nBooking ID: ${payload.bookingId}\nPlease keep this schedule in mind.`;

    const content = this.renderLayout(
      'Booking Rescheduled',
      `Hello${payload.userName ? ` ${payload.userName}` : ''},<br/>Your counseling session has been rescheduled.`,
      [
        { label: 'Counselor', value: payload.counselorName },
        { label: 'New Start', value: start },
        { label: 'New End', value: end },
        { label: 'Fee', value: `$${payload.fee}` },
        { label: 'Booking ID', value: payload.bookingId },
      ],
      'Please keep this updated schedule in mind. We are wishing you the best.'
    );

    await this.sendMail(payload.to, subject, content.html, text, content.attachments);
  }
}

export const mailService = new MailService();
