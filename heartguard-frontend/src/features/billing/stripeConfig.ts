/**
 * Stripe Configuration for HeartGuard Web Protection
 * TEST MODE ONLY - Do not use production keys
 */

export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'HeartGuard Web Protection - Basic',
    price: '$9/mo',
    priceId: 'price_basic_monthly_test',
    features: [
      '30 chat analyses per month',
      '10 photo verifications per month',
      'Basic risk warnings',
      'SafetyReply™ suggestions',
      'Scam Hotspot Map™',
      '6 months report history'
    ]
  },
  plus: {
    name: 'HeartGuard Web Protection - Plus',
    price: '$19/mo',
    priceId: 'price_plus_monthly_test',
    features: [
      '150 chat analyses per month',
      '30 photo verifications per month',
      'Evidence Locker™ PDFs (10/month)',
      'IP Intelligence',
      'Explainable AI Dashboard',
      'Guardian Mode™ (5 conversations)',
      'FamilyLink™ (3 contacts)',
      '12 months report history'
    ],
    popular: true
  },
  family: {
    name: 'HeartGuard Web Protection - Family',
    price: '$29/mo',
    priceId: 'price_family_monthly_test',
    features: [
      'Unlimited chat analyses',
      'Unlimited photo verifications',
      'Evidence Locker™ PDFs (unlimited)',
      'IP Intelligence',
      'Explainable AI Dashboard',
      'Guardian Mode™ (unlimited)',
      'FamilyLink™ (5 contacts)',
      'Unlimited report history',
      'Priority support'
    ]
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
