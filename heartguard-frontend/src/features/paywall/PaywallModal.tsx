/**
 * Paywall Modal
 * Shows after first free scan to encourage subscription
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Check, Sparkles } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function PaywallModal({ open, onClose, onSubscribe }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-primary" />
              <Lock className="w-6 h-6 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Unlock Full Protection
          </DialogTitle>
          <DialogDescription className="text-center">
            You've used your free safety check. Upgrade to continue protecting yourself.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">What You Get</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Unlimited chat & photo scans</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Evidence Locker™ PDF reports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Guardian Mode™ real-time alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>FamilyLink™ protection for loved ones</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Zero judgment. 100% private.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">95% accuracy</Badge>
            <Badge variant="secondary">Trusted globally</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={onSubscribe} className="w-full" size="lg">
            <Shield className="w-4 h-4 mr-2" />
            Start Your Free Safety Check
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Plans start at $9/month. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
