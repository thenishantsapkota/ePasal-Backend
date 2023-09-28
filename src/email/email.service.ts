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
      <p>Please verify your email address.</p>
      <p style="color:tomato;font-size:25px;letter-spacing:2px;">
      <b>${generatedOtp}</b>
      </p>
      <p>This code <b>expires in 10 minutes</b>.</p>
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
      <p>Please use this code to reset your password.</p>
      <p style="color:tomato;font-size:25px;letter-spacing:2px;">
      <b>${generatedOtp}</b>
      </p>
      <p>This code <b>expires in 10 minutes</b>.</p>
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
