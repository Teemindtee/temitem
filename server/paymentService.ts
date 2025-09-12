import crypto from 'crypto';

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number; // in NGN (Nigerian Naira)
  popular?: boolean;
}

export const TOKEN_PACKAGES = [];