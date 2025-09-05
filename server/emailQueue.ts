
interface QueuedEmail {
  id: string;
  template: EmailTemplate;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttempt?: Date;
  error?: string;
}

class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor(private emailService: any) {
    // Process queue every 30 seconds
    setInterval(() => this.processQueue(), 30000);
  }

  async addToQueue(template: EmailTemplate, priority: 'high' | 'normal' = 'normal'): Promise<string> {
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedEmail: QueuedEmail = {
      id: emailId,
      template,
      attempts: 0,
      maxAttempts: this.maxRetries,
      createdAt: new Date()
    };

    if (priority === 'high') {
      this.queue.unshift(queuedEmail);
    } else {
      this.queue.push(queuedEmail);
    }

    console.log(`Email queued with ID: ${emailId}`);
    
    // Try to process immediately if not already processing
    if (!this.processing) {
      setTimeout(() => this.processQueue(), 1000);
    }

    return emailId;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`Processing email queue: ${this.queue.length} emails pending`);

    while (this.queue.length > 0) {
      const email = this.queue[0];
      
      try {
        email.attempts++;
        email.lastAttempt = new Date();
        
        const success = await this.emailService.sendEmail(email.template);
        
        if (success) {
          console.log(`Email ${email.id} sent successfully`);
          this.queue.shift(); // Remove from queue
        } else {
          throw new Error('Email sending returned false');
        }
        
      } catch (error: any) {
        console.error(`Failed to send email ${email.id} (attempt ${email.attempts}):`, error.message);
        email.error = error.message;
        
        if (email.attempts >= email.maxAttempts) {
          console.error(`Email ${email.id} failed permanently after ${email.attempts} attempts`);
          this.queue.shift(); // Remove from queue
          await this.handleFailedEmail(email);
        } else {
          console.log(`Email ${email.id} will be retried (${email.attempts}/${email.maxAttempts})`);
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!);
          break; // Wait for next processing cycle
        }
      }
      
      // Small delay between emails to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }

  private async handleFailedEmail(email: QueuedEmail): Promise<void> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const failedDir = path.join(process.cwd(), 'logs', 'failed-emails');
      await fs.mkdir(failedDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `failed_${timestamp}_${email.id}.json`;
      const filepath = path.join(failedDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify({
        ...email,
        failedAt: new Date().toISOString()
      }, null, 2));
      
      console.log(`Failed email logged to: ${filepath}`);
    } catch (logError) {
      console.error('Failed to log failed email:', logError);
    }
  }

  getQueueStatus(): { pending: number, processing: boolean } {
    return {
      pending: this.queue.length,
      processing: this.processing
    };
  }
}

import { EmailService, EmailTemplate } from './emailService';

export const emailQueue = new EmailQueue(EmailService.getInstance());
export { EmailQueue };
