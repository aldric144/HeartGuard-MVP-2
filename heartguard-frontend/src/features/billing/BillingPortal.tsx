/**
 * Billing Portal Component
 * Allows users to manage their subscription
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from './stripeConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface BillingPortalProps {
  userId?: string;
}

export function BillingPortal({ userId }: BillingPortalProps) {
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | 'free'>('free');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch(`${API_URL}/billing/status`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentTier(data.tier || 'free');
        }
      } catch (err) {
        console.error('Failed to load subscription:', err);
      }
    };
    loadSubscription();
  }, []);

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          return_url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }

      const data = await response.json();
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Manage Subscription
          </CardTitle>
          <CardDescription>
            View and manage your HeartGuard subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Current Plan</h3>
              <p className="text-sm text-muted-foreground">
                {currentTier === 'free' ? 'Free Plan' : SUBSCRIPTION_TIERS[currentTier as SubscriptionTier].name}
              </p>
            </div>
            <Badge variant={currentTier === 'free' ? 'secondary' : 'default'}>
              {currentTier === 'free' ? 'Free' : currentTier.toUpperCase()}
            </Badge>
          </div>

          {currentTier !== 'free' && (
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Subscription
                </>
              )}
            </Button>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              You can update your payment method, view invoices, and cancel your subscription
              through the Stripe billing portal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
