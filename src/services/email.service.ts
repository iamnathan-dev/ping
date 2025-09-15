import nodemailer, { Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST as string,
      port: parseInt(process.env.EMAIL_PORT as string),
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    full_name: string,
    link: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "[URGENT]: Verify email address",
      html: `
        <h1>Hello, ${full_name}!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <div>
          <a href="${process.env.CLIENT_URL}/verify-email?token=${link}">Verify email</a>
        </div>

        <p>This link will expire in 1 hour.</p>
        <p>If you didn't register, please ignore this email.</p>
        <p>Best regards,<br>The Ping Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${to}`);
    } catch (error) {
      console.error(`Error sending verification email to ${to}:`, error);
      throw new Error("Failed to send welcome email");
    }
  }
}
