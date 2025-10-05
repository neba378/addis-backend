import nodemailer from "nodemailer";
import { env } from "../config/env";

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: false, // use SSL
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

export const emailService = {
  /**
   * Send invitation email to new users
   */
  async sendInvitationEmail(
    email: string,
    name: string,
    tempPassword: string
  ): Promise<boolean> {
    try {
      const subject = `Welcome to ${env.app.name} - Your Account is Ready`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Invitation</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .password-box {
                    background: #fff;
                    border: 2px dashed #667eea;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
                .button {
                    display: inline-block;
                    background: #667eea;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Welcome to ${env.app.name}</h1>
                <p>Your account has been created successfully</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name},</h2>
                
                <p>You have been invited to join the ${
                  env.app.name
                } system. Your account has been created and is ready for use.</p>
                
                <div class="warning">
                    <strong>Important Security Notice:</strong> Please change your password immediately after first login.
                </div>
                
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                
                <div class="password-box">
                    Temporary Password: ${tempPassword}
                </div>
                
                <p>To get started, please click the button below to access the system:</p>
                
                <div style="text-align: center;">
                    <a href="${
                      env.app.url
                    }/login" class="button">Login to Your Account</a>
                </div>
                
                <h3>Next Steps:</h3>
                <ol>
                    <li>Click the login button above</li>
                    <li>Enter your email and temporary password</li>
                    <li>You will be prompted to change your password</li>
                    <li>Start using the system</li>
                </ol>
                
                <p>If you have any questions or need assistance, please contact our support team.</p>
                
                <p>Best regards,<br>The ${env.app.name} Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${
        env.app.name
      }. All rights reserved.</p>
            </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: env.email.from,
        to: email,
        subject: subject,
        html: html,
        text: `Welcome to ${env.app.name}!\n\nHello ${name},\n\nYou have been invited to join the ${env.app.name} system.\n\nYour login credentials:\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease login at: ${env.app.url}/login\n\nImportant: Change your password after first login.\n\nBest regards,\nThe ${env.app.name} Team`, // Plain text version
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Invitation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send invitation email to ${email}:`, error);
      return false;
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      const subject = `Password Reset Request - ${env.app.name}`;
      const resetLink = `${env.app.url}/reset-password?token=${resetToken}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .button {
                    display: inline-block;
                    background: #ff6b6b;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .token-box {
                    background: #fff;
                    border: 2px dashed #ff6b6b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    text-align: center;
                    font-family: monospace;
                    font-size: 14px;
                    word-break: break-all;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Password Reset</h1>
                <p>Reset your account password</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name},</h2>
                
                <p>We received a request to reset your password for your ${
                  env.app.name
                } account.</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset Your Password</a>
                </div>
                
                <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                
                <div class="token-box">
                    ${resetLink}
                </div>
                
                <div class="warning">
                    <strong>Security Notice:</strong>
                    <ul>
                        <li>This link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will not change until you create a new one</li>
                    </ul>
                </div>
                
                <p>For security reasons, this link can only be used once and will expire after 1 hour.</p>
                
                <p>If you have any questions, please contact our support team.</p>
                
                <p>Best regards,<br>The ${env.app.name} Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${
        env.app.name
      }. All rights reserved.</p>
            </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: env.email.from,
        to: email,
        subject: subject,
        html: html,
        text: `Password Reset Request - ${env.app.name}\n\nHello ${name},\n\nWe received a request to reset your password.\n\nReset Link: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe ${env.app.name} Team`,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to send password reset email to ${email}:`,
        error
      );
      return false;
    }
  },

  /**
   * Send account activation notification
   */
  async sendAccountActivatedEmail(
    email: string,
    name: string
  ): Promise<boolean> {
    try {
      const subject = `Account Activated - ${env.app.name}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Activated</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .button {
                    display: inline-block;
                    background: #00b894;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Account Activated</h1>
                <p>Your account is now active</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name},</h2>
                
                <p>Great news! Your account with ${
                  env.app.name
                } has been activated successfully.</p>
                
                <p>You can now access all the features and services available to your account.</p>
                
                <div style="text-align: center;">
                    <a href="${
                      env.app.url
                    }/login" class="button">Access Your Account</a>
                </div>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Welcome aboard!<br>The ${env.app.name} Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${
        env.app.name
      }. All rights reserved.</p>
            </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.from,
        to: email,
        subject: subject,
        html: html,
        text: `Account Activated - ${env.app.name}\n\nHello ${name},\n\nYour account has been activated successfully.\n\nYou can now login at: ${env.app.url}/login\n\nWelcome aboard!\nThe ${env.app.name} Team`,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Account activated email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to send account activated email to ${email}:`,
        error
      );
      return false;
    }
  },

  /**
   * Test email service connectivity
   */
  async testEmailService(): Promise<boolean> {
    try {
      const testEmail = "test@example.com";
      const result = await this.sendInvitationEmail(
        testEmail,
        "Test User",
        "test-password-123"
      );

      console.log("✅ Email service test completed");
      return result;
    } catch (error) {
      console.error("❌ Email service test failed:", error);
      return false;
    }
  },
};
