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
}