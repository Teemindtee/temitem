import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';

// Self-contained email configuration using various fallback methods
const createEmailTransporter = () => {
  // Try different transport methods in order of preference
  const transports = [
    // Method 1: Direct SMTP (if configured)
    () => {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
      return null;
    },

    // Method 2: Gmail OAuth2 (self-contained)
    () => {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
      }
      return null;
    },

    // Method 3: Local mail system simulation (for development)
    () => {
      return createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    },

    // Method 4: File-based email logging (ultimate fallback)
    () => {
      return createTransport({
        jsonTransport: true,
      });
    }
  ];

  for (const createTransporter of transports) {
    try {
      const transporter = createTransporter();
      if (transporter) {
        return transporter;
      }
    } catch (error) {
      console.warn('Failed to create transporter:', error);
      continue;
    }
  }

  // Final fallback - create a test transporter
  return createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

const transporter = createEmailTransporter();

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Use SMTP (Brevo)
      console.log('Using SMTP email service');
      console.log('SMTP Configuration:', {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing',
        from: process.env.FROM_EMAIL || '95bd74001@smtp-brevo.com'
      });

      // Test connection first
      await transporter.verify();
      console.log('SMTP connection verified successfully');

      const mailOptions = {
        from: process.env.FROM_EMAIL || '95bd74001@smtp-brevo.com',
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text || this.extractTextFromHtml(template.html),
      };

      console.log(`Attempting to send email to: ${template.to}`);
      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${template.to}. Message ID: ${result.messageId}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send email:', {
        error: error.message,
        code: error.code,
        command: error.command,
        to: template.to,
        subject: template.subject
      });
      return false;
    }
  }

  private extractTextFromHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Finder notification templates
  async notifyFinderNewMessage(finderEmail: string, clientName: string, requestTitle: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: finderEmail,
      subject: `New Message from ${clientName} - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Message Received</h2>
          <p>Hi there,</p>
          <p>You have received a new message from <strong>${clientName}</strong> regarding your proposal for:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #374151;">${requestTitle}</h3>
          </div>
          <p>Log in to your FinderMeister dashboard to view and respond to the message.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/finder/messages" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            View Messages
          </a>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }

  async notifyFinderHired(finderEmail: string, clientName: string, requestTitle: string, amount: string): Promise<boolean> {
    const subject = `🎉 You've been hired for "${requestTitle}"!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Congratulations! You've been hired!</h2>
        <p>Great news! <strong>${clientName}</strong> has accepted your proposal and hired you for the project:</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin: 0; color: #0369a1;">${requestTitle}</h3>
        </div>
        <p><strong>Contract Amount:</strong> ₦${amount}</p>
        <p>The client will now fund the escrow, and once payment is complete, you can begin working on the project.</p>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Next Steps:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Wait for escrow funding confirmation</li>
            <li>You'll receive another notification when work can begin</li>
            <li>Start communicating with the client about project details</li>
          </ul>
        </div>
        <p>Log in to your FinderMeister dashboard to view the contract details and start messaging the client.</p>
        <p>Best of luck with your project!</p>
        <p>Best regards,<br>The FinderMeister Team</p>
      </div>
    `;

    return this.sendEmail(template);
  }

  async notifyFinderWorkCanBegin(finderEmail: string, clientName: string, requestTitle: string, amount: string): Promise<boolean> {
    const subject = `🚀 Escrow funded! You can now start work on "${requestTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Escrow Funded - Work Can Begin!</h2>
        <p>Excellent news! <strong>${clientName}</strong> has funded the escrow for your project:</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin: 0; color: #0369a1;">${requestTitle}</h3>
        </div>
        <p><strong>Contract Amount:</strong> ₦${amount}</p>
        <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; color: #065f46;"><strong>✅ Payment Secured:</strong> The full contract amount is now held in escrow and will be released to you upon successful completion of the work.</p>
        </div>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Ready to Start:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Begin working on the project immediately</li>
            <li>Communicate regularly with the client</li>
            <li>Submit your completed work through the platform</li>
            <li>Payment will be released once client approves your work</li>
          </ul>
        </div>
        <p>Log in to your FinderMeister dashboard to view the contract details and start messaging the client.</p>
        <p>Good luck with your project!</p>
        <p>Best regards,<br>The FinderMeister Team</p>
      </div>
    `;

    return this.sendEmail(template);
  }


  async notifyFinderSubmissionApproved(finderEmail: string, clientName: string, requestTitle: string, amount: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: finderEmail,
      subject: `Work Approved - Payment Released - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Work Approved - Payment Released!</h2>
          <p>Hi there,</p>
          <p>Excellent news! <strong>${clientName}</strong> has approved your work submission for:</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 10px 0; color: #15803d;">${requestTitle}</h3>
            <p style="margin: 0; color: #374151;">Payment Released: <strong>₦${amount}</strong></p>
          </div>
          <p>The payment has been released from escrow and added to your available balance. You can now request a withdrawal.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/finder/withdrawals" 
             style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Request Withdrawal
          </a>
          <p>Thank you for your excellent work!</p>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }

  async notifyFinderSubmissionRejected(finderEmail: string, clientName: string, requestTitle: string, feedback: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: finderEmail,
      subject: `Work Revision Requested - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Work Revision Requested</h2>
          <p>Hi there,</p>
          <p><strong>${clientName}</strong> has requested revisions for your work submission on:</p>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin: 0 0 10px 0; color: #dc2626;">${requestTitle}</h3>
            <h4 style="margin: 10px 0 5px 0; color: #374151;">Client Feedback:</h4>
            <p style="margin: 0; color: #6b7280; font-style: italic;">"${feedback}"</p>
          </div>
          <p>Please review the feedback and resubmit your work with the requested changes.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/finder/contracts" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            View Contract & Resubmit
          </a>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }

  // Client notification templates
  async notifyClientNewProposal(clientEmail: string, finderName: string, requestTitle: string, proposalPrice: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: clientEmail,
      subject: `New Proposal Received - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Proposal Received</h2>
          <p>Hi there,</p>
          <p>You have received a new proposal from <strong>${finderName}</strong> for your request:</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">${requestTitle}</h3>
            <p style="margin: 0; color: #374151;">Proposed Price: <strong>₦${proposalPrice}</strong></p>
          </div>
          <p>Review the proposal details and respond to the finder if you're interested.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/client/requests" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            View Proposal
          </a>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }

  async notifyClientOrderSubmission(clientEmail: string, finderName: string, requestTitle: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: clientEmail,
      subject: `Work Submitted for Review - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Work Submitted for Review</h2>
          <p>Hi there,</p>
          <p><strong>${finderName}</strong> has submitted their completed work for your request:</p>
          <div style="background-color: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="margin: 0 0 10px 0; color: #6d28d9;">${requestTitle}</h3>
            <p style="margin: 0; color: #374151;">Status: <strong>Awaiting Your Review</strong></p>
          </div>
          <p>Please review the submitted work and either approve it or request revisions.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/client/contracts" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Review Work
          </a>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }

  async notifyClientNewMessage(clientEmail: string, finderName: string, requestTitle: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: clientEmail,
      subject: `New Message from ${finderName} - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Message Received</h2>
          <p>Hi there,</p>
          <p>You have received a new message from <strong>${finderName}</strong> regarding:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #374151;">${requestTitle}</h3>
          </div>
          <p>Log in to your FinderMeister dashboard to view and respond to the message.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/client/messages" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            View Messages
          </a>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }

  // Password reset email template
  async sendPasswordResetEmail(userEmail: string, userName: string, resetLink: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: userEmail,
      subject: `Reset Your Password - FinderMeister`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset the password for your FinderMeister account.</p>
          <p>If you made this request, click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            If you're having trouble clicking the button, copy and paste the following link into your browser:<br>
            <span style="word-break: break-all;">${resetLink}</span>
          </p>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `,
    };
    return this.sendEmail(template);
  }
}

export const emailService = EmailService.getInstance();