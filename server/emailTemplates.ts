
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
}
