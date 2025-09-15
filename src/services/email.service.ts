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
        <h4>Hello, ${full_name}</h4>
        <h1>Confirm your email address</h1>
        <p>Please click the link below to confirm your email address and finish setting up your account. This link is valid for 1 hour.</p>
        <div>
          <a href="${process.env.FRONTEND_URL}/verify/${link}">Confirm</a>
        </div>
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
