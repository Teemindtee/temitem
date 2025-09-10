interface EmailTemplateData {
  [key: string]: any;
}

export class EmailTemplateEngine {
  private static templates: Record<string, { subject: string; html: string; text?: string }> = {
    welcome: {
      subject: 'Welcome to FinderMeister!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Welcome to FinderMeister!</h1>
          <p>Hi {{firstName}},</p>
          <p>Welcome to FinderMeister, Nigeria's premier service marketplace!</p>
          <p>Your account has been created successfully. You can now:</p>
          <ul>
            <li>{{roleSpecificMessage}}</li>
            <li>Connect with trusted professionals</li>
            <li>Manage your projects securely</li>
          </ul>
          <p>Get started by visiting your dashboard.</p>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `
    },

    proposalNotification: {
      subject: 'New Proposal Received - {{requestTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Proposal Received</h2>
          <p>Hi {{clientName}},</p>
          <p>You have received a new proposal from <strong>{{finderName}}</strong> for your request:</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #1e40af;">{{requestTitle}}</h3>
            <p style="margin: 10px 0 0 0;">Proposed Price: <strong>₦{{proposalPrice}}</strong></p>
          </div>
          <p>Review the proposal and respond to the finder if you're interested.</p>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `
    },

    paymentConfirmation: {
      subject: 'Payment Confirmed - {{contractTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Payment Confirmed!</h2>
          <p>Hi {{userName}},</p>
          <p>Your payment has been confirmed for the project:</p>
          <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #065f46;">{{contractTitle}}</h3>
            <p style="margin: 10px 0 0 0;">Amount: <strong>₦{{amount}}</strong></p>
          </div>
          <p>Work can now begin on your project.</p>
          <p>Best regards,<br>The FinderMeister Team</p>
        </div>
      `
    }
  };

  static render(templateName: string, data: EmailTemplateData): { subject: string; html: string; text?: string } {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const rendered = {
      subject: this.interpolate(template.subject, data),
      html: this.interpolate(template.html, data),
      text: template.text ? this.interpolate(template.text, data) : undefined
    };

    return rendered;
  }

  private static interpolate(template: string, data: EmailTemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  static addTemplate(name: string, template: { subject: string; html: string; text?: string }): void {
    this.templates[name] = template;
  }

  static getAvailableTemplates(): string[] {
    return Object.keys(this.templates);
  }

  static supportReply(userName: string, originalSubject: string, replyMessage: string, adminName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">FinderMeister Support</h1>
        </div>

        <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${userName},</h2>

          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Thank you for contacting FinderMeister support. We've reviewed your inquiry regarding "<strong>${originalSubject}</strong>" and have a response for you.
          </p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">Our Response:</h3>
            <div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</div>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            If you have any follow-up questions or need further assistance, please don't hesitate to reach out to us.
          </p>

          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #7f1d1d; margin: 0; font-size: 14px;">
              <strong>Need more help?</strong> Visit our support page or reply to this email.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            ${adminName}<br>
            FinderMeister Support Team
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 FinderMeister. All rights reserved.</p>
          <p>
            <a href="https://findermeister.com" style="color: #dc2626; text-decoration: none;">Website</a> |
            <a href="https://findermeister.com/support" style="color: #dc2626; text-decoration: none;">Support</a> |
            <a href="https://findermeister.com/terms" style="color: #dc2626; text-decoration: none;">Terms</a>
          </p>
        </div>
      </div>
    `;
  }
}