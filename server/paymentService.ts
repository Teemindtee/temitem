import crypto from 'crypto';

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number; // in NGN (Nigerian Naira)
  popular?: boolean;
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 10,
    price: 5000, // ₦5,000
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    tokens: 25,
    price: 10000, // ₦10,000
    popular: true
  },
  {
    id: 'business',
    name: 'Business Pack',
    tokens: 50,
    price: 18000, // ₦18,000
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    tokens: 100,
    price: 30000, // ₦30,000
  }
];

export class PaystackService {
  private secretKey: string;
  private publicKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
    
    if (!this.secretKey) {
      console.warn('PAYSTACK_SECRET_KEY not found in environment variables');
    }
  }

  async initializeTransaction(email: string, amount: number, reference: string, metadata: any = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          currency: 'NGN',
          metadata: {
            ...metadata,
            custom_fields: [
              {
                display_name: 'Product',
                variable_name: 'product',
                value: 'Token Purchase'
              }
            ]
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize transaction');
      }

      return data.data;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify transaction');
      }

      return data.data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) return false;
    
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }

  generateTransactionReference(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TKN_${userId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
  }
}