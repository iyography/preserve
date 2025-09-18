import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  /**
   * Escape HTML characters to prevent injection attacks
   */
  private static escapeHTML(text: string | undefined | null): string {
    if (!text) return '';
    
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
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
            <h1 style="color: #7c3aed;">Welcome to Preserving Connections, ${this.escapeHTML(userName)}!</h1>
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

  /**
   * Send partner application notification to admin
   */
  static async sendPartnerApplicationNotification(formData: any) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping partner notification email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: ['davidiya3@gmail.com'],
        subject: `New Partner Application - ${this.escapeHTML(formData.businessName)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Preserving Connections</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Partner Application Notification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">New Partner Application Received</h2>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Business Information</h3>
                <p style="margin: 5px 0;"><strong>Business Name:</strong> ${this.escapeHTML(formData.businessName)}</p>
                <p style="margin: 5px 0;"><strong>Business Type:</strong> ${this.escapeHTML(formData.businessType)}</p>
                <p style="margin: 5px 0;"><strong>Business Size:</strong> ${this.escapeHTML(formData.businessSize)}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Contact Information</h3>
                <p style="margin: 5px 0;"><strong>Contact Name:</strong> ${this.escapeHTML(formData.contactName)}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${this.escapeHTML(formData.email)}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${this.escapeHTML(formData.phone)}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Partnership Details</h3>
                <p style="margin: 5px 0;"><strong>Current Grief Support:</strong> ${this.escapeHTML(formData.currentGriefSupport)}</p>
                <p style="margin: 5px 0;"><strong>Technology Comfort:</strong> ${this.escapeHTML(formData.technologyComfort)}</p>
                <p style="margin: 5px 0;"><strong>Revenue Share Interest:</strong> ${this.escapeHTML(formData.revenueShareInterest)}</p>
                <p style="margin: 5px 0;"><strong>Pilot Capacity:</strong> ${this.escapeHTML(formData.pilotCapacity)}</p>
                <p style="margin: 5px 0;"><strong>Timeline:</strong> ${this.escapeHTML(formData.timeline)}</p>
                <p style="margin: 5px 0;"><strong>NDA Agreed:</strong> ${formData.ndaAgreed ? 'Yes' : 'No'}</p>
              </div>
              
              ${formData.additionalInfo ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Additional Information</h3>
                <p style="margin: 5px 0; background: white; padding: 10px; border-radius: 4px;">${this.escapeHTML(formData.additionalInfo)}</p>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; font-size: 14px; color: #666;">
              <p style="margin: 0;">Application submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send partner notification email:', error);
        return { success: false, error };
      }

      console.log('Partner notification email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send waitlist application notification to admin
   */
  static async sendWaitlistApplicationNotification(formData: any) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping waitlist notification email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: ['davidiya3@gmail.com'],
        subject: `New Waitlist Application - ${this.escapeHTML(formData.name)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Preserving Connections</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Waitlist Application Notification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">New Waitlist Application Received</h2>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Personal Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${this.escapeHTML(formData.name)}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${this.escapeHTML(formData.email)}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${this.escapeHTML(formData.phone)}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Grief Context</h3>
                <p style="margin: 5px 0;"><strong>Relationship to Deceased:</strong> ${this.escapeHTML(formData.relationshipToDeceased)}</p>
                <p style="margin: 5px 0;"><strong>Time Since Loss:</strong> ${this.escapeHTML(formData.timeSinceLoss)}</p>
                <p style="margin: 5px 0;"><strong>Professional Support:</strong> ${this.escapeHTML(formData.professionalSupport)}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Technical Information</h3>
                <p style="margin: 5px 0;"><strong>Technology Comfort:</strong> ${this.escapeHTML(formData.technologyComfort)}</p>
              </div>
              
              ${formData.additionalInfo ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Additional Information</h3>
                <p style="margin: 5px 0; background: white; padding: 10px; border-radius: 4px;">${this.escapeHTML(formData.additionalInfo)}</p>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; font-size: 14px; color: #666;">
              <p style="margin: 0;">Application submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send waitlist notification email:', error);
        return { success: false, error };
      }

      console.log('Waitlist notification email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send partner application confirmation to applicant
   */
  static async sendPartnerApplicationConfirmation(to: string, businessName: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping partner confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: [to],
        subject: 'Partnership Application Received - Preserving Connections',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Preserving Connections</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Keeping memories alive through meaningful connections</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Thank You for Your Partnership Interest</h2>
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Dear ${this.escapeHTML(businessName)} team,
              </p>
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Thank you for your interest in partnering with Preserving Connections. We've successfully received your partnership application and are excited about the possibility of working together to support families during their most difficult times.
              </p>
              
              <div style="background: #7c3aed; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 18px;">Next Steps</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Our partnership team will review your application within 48 hours</li>
                  <li style="margin-bottom: 8px;">We'll contact you to schedule a discovery call</li>
                  <li style="margin-bottom: 8px;">Together, we'll explore how Preserving Connections can enhance your grief support services</li>
                </ul>
              </div>
              
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Our grief technology platform is designed to work seamlessly with funeral directors, estate planners, hospice coordinators, and other professionals who support families during loss. We're committed to creating meaningful partnerships that honor the dignity of grief while providing innovative support tools.
              </p>
              
              <p style="margin: 0 0 10px 0; line-height: 1.6; font-size: 16px;">
                If you have any immediate questions, please don't hesitate to reach out to us at this email address.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; font-size: 14px; color: #666;">
              <p style="margin: 0;">With gratitude,<br>The Preserving Connections Partnership Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send partner confirmation email:', error);
        return { success: false, error };
      }

      console.log('Partner confirmation email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send waitlist application confirmation to applicant
   */
  static async sendWaitlistApplicationConfirmation(to: string, userName: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping waitlist confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'support@preservingconnections.com',
        to: [to],
        subject: 'Welcome to Preserving Connections Waitlist',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Preserving Connections</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Keeping memories alive through meaningful connections</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Thank You for Joining Our Waitlist</h2>
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Dear ${this.escapeHTML(userName)},
              </p>
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Thank you for your interest in Preserving Connections. We understand that you're exploring ways to honor and preserve precious memories, and we're honored that you've chosen to join our waitlist during this meaningful time.
              </p>
              
              <div style="background: #7c3aed; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 18px;">What Happens Next</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Our team will carefully review your application</li>
                  <li style="margin-bottom: 8px;">We'll reach out personally to learn more about your specific needs</li>
                  <li style="margin-bottom: 8px;">You'll receive priority access when we begin accepting new families</li>
                </ul>
              </div>
              
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                Preserving Connections is more than technology – it's a compassionate approach to keeping memories alive and maintaining meaningful connections with those who have passed. We're building something truly special, and your patience means everything to us.
              </p>
              
              <p style="margin: 0 0 10px 0; line-height: 1.6; font-size: 16px;">
                Please don't hesitate to reach out if you have any questions. We're here to support you.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; font-size: 14px; color: #666;">
              <p style="margin: 0;">With care and understanding,<br>The Preserving Connections Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send waitlist confirmation email:', error);
        return { success: false, error };
      }

      console.log('Waitlist confirmation email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }
}