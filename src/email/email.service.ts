import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendOtp(email: string) {
    const generatedOtp = this.generateOtp();

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your account.',
      from: this.config.get('SMTP_EMAIL'),
      html: `
       <div style="font-family: Arial, sans-serif; padding: 20px; color: #444;">
      <h2 style="color: #2F2F2F;">Email Verification</h2>
      <p>To verify your email address, please use the following One Time Password (OTP):</p>
      <div style="font-size: 24px; color: #4CAF50; font-weight: bold; margin: 20px 0;">${generatedOtp}</div>
      <p>Please note, this OTP will expire in 10 minutes.</p>
      <p>Thank you,</p>
      <p>Your Team</p>
    </div>
      `,
    });

    return generatedOtp;
  }

  async sendResetPasswordOtp(email: string) {
    const generatedOtp = this.generateOtp();

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password.',
      from: this.config.get('SMTP_EMAIL'),
      html: `
       <div style="font-family: Arial, sans-serif; padding: 20px; color: #444;">
      <h2 style="color: #2F2F2F;">Email Verification</h2>
      <p>To reset your password, please use the following One Time Password (OTP):</p>
      <div style="font-size: 24px; color: #4CAF50; font-weight: bold; margin: 20px 0;">${generatedOtp}</div>
      <p>Please note, this OTP will expire in 10 minutes.</p>
      <p>Thank you,</p>
      <p>Your Team</p>
    </div>
      `,
    });

    return generatedOtp;
  }

  private generateOtp() {
    const otpLength = 6;
    const min = Math.pow(10, otpLength - 1);
    const max = Math.pow(10, otpLength) - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
