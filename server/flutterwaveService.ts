
import crypto from 'crypto';

export interface FlutterwaveTokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number; // in NGN (Nigerian Naira)
  popular?: boolean;
}

export const FLUTTERWAVE_TOKEN_PACKAGES: FlutterwaveTokenPackage[] = [
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

export function getTokensFromAmount(amount: number): number {
  const packageMapping: { [key: number]: number } = {
    5000: 10,   // Starter Pack
    10000: 25,  // Professional Pack
    18000: 50,  // Business Pack
    30000: 100  // Enterprise Pack
  };

  return packageMapping[amount] || 0;
}

export class FlutterwaveService {
  private secretKey: string;
  private publicKey: string;
  private baseUrl = 'https://api.flutterwave.com/v3';

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
    
    if (!this.secretKey) {
      console.warn('FLUTTERWAVE_SECRET_KEY not found in environment variables');
    }
  }

  isConfigured(): boolean {
    return !!this.secretKey && !!this.publicKey;
  }

  async initializeTransaction(
    email: string, 
    amount: number, 
    reference: string, 
    metadata: any = {}, 
    callbackUrl?: string,
    redirectUrl?: string
  ) {
    if (!this.isConfigured()) {
      throw new Error('Flutterwave service is not properly configured. Please check your API keys.');
    }

    try {
      const payload: any = {
        tx_ref: reference,
        amount: amount,
        currency: 'NGN',
        redirect_url: redirectUrl || `${process.env.BASE_URL || 'http://localhost:5000'}/finder/payment-success?payment=success&reference=${reference}`,
        customer: {
          email,
          name: metadata.customerName || 'FinderMeister User',
          phonenumber: metadata.phone || ''
        },
        customizations: {
          title: 'FinderMeister Token Purchase',
          description: `Purchase of ${metadata.tokens || 'N/A'} FinderTokens`,
          logo: 'https://your-logo-url.com/logo.png'
        },
        meta: {
          ...metadata,
          source: 'findermeister',
          type: metadata.type || 'token_purchase'
        }
      };

      // Add callback URL if provided
      if (callbackUrl) {
        payload.callback_url = callbackUrl;
      }

      console.log('Flutterwave initialize payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Flutterwave response:', JSON.stringify(data, null, 2));
      
      if (!response.ok || data.status !== 'success') {
        console.error('Flutterwave initialization failed:', data);
        throw new Error(data.message || 'Failed to initialize transaction');
      }

      return {
        authorization_url: data.data.link,
        reference: reference,
        access_code: data.data.id
      };
    } catch (error) {
      console.error('Flutterwave initialization error:', error);
      throw error;
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Flutterwave verification response:', JSON.stringify(data, null, 2));
      
      if (!response.ok || data.status !== 'success') {
        console.error('Flutterwave verification failed:', data);
        throw new Error(data.message || 'Failed to verify transaction');
      }

      return {
        status: data.data.status === 'successful' ? 'success' : 'failed',
        amount: data.data.amount,
        currency: data.data.currency,
        tx_ref: data.data.tx_ref,
        id: data.data.id,
        metadata: data.data.meta || {}
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature || !this.secretKey) {
      console.log('Missing signature or secret key for webhook verification');
      return false;
    }
    
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    
    const isValid = hash === signature;
    
    if (!isValid) {
      console.log('Flutterwave webhook signature verification failed');
      console.log('Expected:', hash);
      console.log('Received:', signature);
    }
    
    return isValid;
  }

  generateTransactionReference(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `FLW_${userId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
  }

  async getAllTransactions(page: number = 1, pageSize: number = 20) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions?page=${page}&page_size=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch transactions');
      }

      return data.data;
    } catch (error) {
      console.error('Flutterwave get transactions error:', error);
      throw error;
    }
  }

  async refundTransaction(transactionId: string, amount?: number) {
    try {
      const payload: any = {
        id: transactionId
      };

      if (amount) {
        payload.amount = amount;
      }

      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to process refund');
      }

      return data.data;
    } catch (error) {
      console.error('Flutterwave refund error:', error);
      throw error;
    }
  }
}
