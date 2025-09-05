
import crypto from 'crypto';

export interface OpayTokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number; // in NGN (Nigerian Naira)
  popular?: boolean;
}

export const OPAY_TOKEN_PACKAGES: OpayTokenPackage[] = [
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

export class OpayService {
  private merchantId: string;
  private publicKey: string;
  private privateKey: string;
  private baseUrl: string;

  constructor() {
    this.merchantId = process.env.OPAY_MERCHANT_ID || '';
    this.publicKey = process.env.OPAY_PUBLIC_KEY || '';
    this.privateKey = process.env.OPAY_PRIVATE_KEY || '';
    this.baseUrl = process.env.OPAY_BASE_URL || 'https://sandboxapi.opaycheckout.com'; // Use sandbox for testing
    
    if (!this.merchantId || !this.publicKey || !this.privateKey) {
      console.warn('Opay service configuration incomplete. Please check environment variables.');
    }
  }

  isConfigured(): boolean {
    return !!this.merchantId && !!this.publicKey && !!this.privateKey;
  }

  private generateSignature(data: any): string {
    // Sort the data keys alphabetically
    const sortedKeys = Object.keys(data).sort();
    
    // Create the string to sign
    const stringToSign = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    // Add the private key at the end
    const finalString = stringToSign + '&' + this.privateKey;
    
    // Create SHA-512 hash
    return crypto.createHash('sha512').update(finalString).digest('hex');
  }

  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
    metadata: any = {},
    callbackUrl?: string,
    returnUrl?: string
  ) {
    if (!this.isConfigured()) {
      throw new Error('Opay service is not properly configured. Please check your API keys.');
    }

    try {
      const transactionData: any = {
        reference,
        mchShortName: this.merchantId,
        productName: 'FinderToken Purchase',
        productDesc: `Purchase of ${metadata.tokens || 'N/A'} FinderTokens`,
        userPhone: metadata.phone || '',
        userRequestIp: '127.0.0.1',
        amount: Math.round(amount * 100), // Convert to kobo
        currency: 'NGN',
        payMethod: 'BankCard,Account,USSD,BankTransfer,OPay',
        payTypes: 'BalancePayment,BonusPayment,OWealth',
        callbackUrl: callbackUrl || `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/opay/callback`,
        returnUrl: returnUrl || `${process.env.BASE_URL || 'http://localhost:5000'}/finder/payment-success`,
        expireAt: Math.floor(Date.now() / 1000) + 1800, // 30 minutes expiry
        userClientIP: '127.0.0.1'
      };

      // Generate signature
      const signature = this.generateSignature(transactionData);

      const payload = {
        ...transactionData,
        sign: signature
      };

      console.log('Opay initialize payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/api/v3/cashier/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MerchantId': this.merchantId,
          'Authorization': `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log('Opay initialize response:', JSON.stringify(data, null, 2));

      if (!response.ok || data.code !== '00000') {
        throw new Error(data.message || 'Failed to initialize Opay transaction');
      }

      return {
        authorization_url: data.data.cashierUrl,
        reference: reference,
        access_code: data.data.orderNo
      };
    } catch (error) {
      console.error('Opay initialization error:', error);
      throw error;
    }
  }

  async verifyTransaction(reference: string) {
    if (!this.isConfigured()) {
      throw new Error('Opay service is not properly configured.');
    }

    try {
      const verificationData = {
        reference,
        mchShortName: this.merchantId
      };

      const signature = this.generateSignature(verificationData);

      const payload = {
        ...verificationData,
        sign: signature
      };

      const response = await fetch(`${this.baseUrl}/api/v3/cashier/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MerchantId': this.merchantId,
          'Authorization': `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log('Opay verification response:', JSON.stringify(data, null, 2));

      if (!response.ok || data.code !== '00000') {
        throw new Error(data.message || 'Failed to verify Opay transaction');
      }

      // Map Opay status to standard format
      const transactionStatus = data.data.status;
      let status = 'failed';
      
      if (transactionStatus === 'SUCCESS') {
        status = 'success';
      } else if (transactionStatus === 'PENDING' || transactionStatus === 'INITIAL') {
        status = 'pending';
      }

      return {
        status,
        reference: data.data.reference,
        amount: data.data.amount / 100, // Convert from kobo
        currency: data.data.currency,
        transaction_date: data.data.finishTime,
        metadata: {
          orderNo: data.data.orderNo,
          payMethod: data.data.payMethod
        }
      };
    } catch (error) {
      console.error('Opay verification error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) return false;
    
    try {
      const computedSignature = crypto
        .createHash('sha512')
        .update(payload + this.privateKey)
        .digest('hex');
      
      return computedSignature === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  generateTransactionReference(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `OPAY_${userId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
  }
}
