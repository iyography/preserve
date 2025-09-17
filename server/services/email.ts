import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  /**
   * Send a welcome email to new users
   */
  static async sendWelcomeEmail(to: string, userName: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping welcome email');
      return;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: [to],
        subject: 'Welcome to Preserving Connections',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">Welcome to Preserving Connections, ${userName}!</h1>
            <p>Thank you for joining our community. We're here to help you preserve precious memories and connections.</p>
            <p>Get started by creating your first persona and begin your journey of preserving memories.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Preserving Connections Team</p>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error };
      }

      console.log('Welcome email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send a notification email
   */
  static async sendNotificationEmail(to: string, subject: string, content: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping notification email');
      return;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: [to],
        subject,
        html: content,
      });

      if (error) {
        console.error('Failed to send notification email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send an email confirmation link
   */
  static async sendConfirmationEmail(to: string, confirmationToken: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    // Construct the confirmation URL using Replit environment variables
    let baseUrl: string;
    
    if (process.env.REPLIT_DEPLOYMENT === '1') {
      // Production deployment - use the primary domain
      const domains = process.env.REPLIT_DOMAINS?.split(',');
      baseUrl = domains?.[0] ? `https://${domains[0]}` : 'https://preservingconnections.replit.app';
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      // Development in Replit workspace
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else {
      // Fallback for local development
      baseUrl = 'http://localhost:5000';
    }
    
    const confirmationUrl = `${baseUrl}/api/confirm-email?token=${confirmationToken}`;

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: [to],
        subject: 'Confirm Your Email Address - Preserving Connections',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Preserving Connections</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Keeping memories alive through meaningful connections</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Confirm Your Email Address</h2>
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Thank you for joining Preserving Connections. To complete your registration and start preserving precious memories, please confirm your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: #7c3aed; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Confirm Email Address
                </a>
              </div>
              
              <p style="margin: 20px 0 0 0; line-height: 1.6; font-size: 14px; color: #666;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all; font-size: 14px; color: #7c3aed;">
                ${confirmationUrl}
              </p>
            </div>
            
            <div style="text-align: center; font-size: 14px; color: #666;">
              <p style="margin: 0 0 10px 0;">This confirmation link will expire in 24 hours.</p>
              <p style="margin: 0;">If you didn't create an account with Preserving Connections, you can safely ignore this email.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; font-size: 14px; color: #666;">
              <p style="margin: 0;">Best regards,<br>The Preserving Connections Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send confirmation email:', error);
        return { success: false, error };
      }

      console.log('Confirmation email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }
}