import nodemailer from "nodemailer";

const smtp = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendCustomerOtpEmail(email: string, code: string) {
  if (!process.env.SMTP_USER) return;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#141009">
      <div style="background:#141009;padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">Tu Gusto</h1>
        <p style="color:#C6A05C;margin:6px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase">Login Verification</p>
      </div>
      <div style="padding:32px;background:#1E1812;border:1px solid #2E261C;text-align:center;border-radius:0 0 16px 16px">
        <p style="color:#F1E8DB;font-size:15px;margin:0 0 8px">Your verification code:</p>
        <div style="background:#251E16;border:1px solid #2E261C;border-radius:12px;padding:16px;margin:16px 0">
          <p style="color:#C6A05C;font-size:36px;font-weight:bold;margin:0;letter-spacing:0.2em">${code}</p>
        </div>
        <p style="color:#A0907F;font-size:12px;margin:16px 0 0">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    </div>`;

  await smtp.sendMail({
    from: `"Tu Gusto" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Tu Gusto — Your login code: ${code}`,
    html,
  });
}

export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
) {
  if (!process.env.SMTP_USER || recipients.length === 0) return;
  for (const to of recipients) {
    try {
      await smtp.sendMail({
        from: `"Tu Gusto" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
    } catch {}
  }
}
