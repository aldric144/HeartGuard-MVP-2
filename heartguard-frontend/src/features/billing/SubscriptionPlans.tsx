/**
 * Subscription Plans Component
 * Displays available subscription tiers and handles checkout
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from './stripeConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SubscriptionPlansProps {
  onSuccess?: () => void;
}

export function SubscriptionPlans({ onSuccess }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setLoading(tier);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier,
          success_url: `${window.location.origin}/billing/success`,
          cancel_url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Protection Plan</h2>
        <p className="text-muted-foreground">
          Unlock full protection with HeartGuard Web Protection
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => {
          const plan = SUBSCRIPTION_TIERS[tier];
          const isPopular = 'popular' in plan && plan.popular;

          return (
            <Card
              key={tier}
              className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name.replace('HeartGuard Web Protection - ', '')}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                >
                  {loading === tier ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>All plans include Apple Pay & Google Pay on web. Cancel anytime.</p>
        <p className="mt-2">TEST MODE - No real charges will be made</p>
      </div>
    </div>
  );
}
