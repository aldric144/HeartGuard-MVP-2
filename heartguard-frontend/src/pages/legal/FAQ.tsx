/**
 * FAQ Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Everything you need to know about HeartGuard
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="what-is">
          <AccordionTrigger className="text-left">
            What is HeartGuard?
          </AccordionTrigger>
          <AccordionContent>
            HeartGuard is an AI-powered safety tool that helps you identify potential romance scams,
            emotional manipulation, and fake online relationships. We analyze chat messages and photos
            to provide risk assessments and safety recommendations.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="how-works">
          <AccordionTrigger className="text-left">
            How does HeartGuard work?
          </AccordionTrigger>
          <AccordionContent>
            Simply paste chat messages or upload photos from your online conversations. Our AI analyzes
            the content for manipulation patterns, inconsistencies, and red flags. You'll receive a
            Trust Score (0-100) and detailed insights about potential risks.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="free-trial">
          <AccordionTrigger className="text-left">
            Do you offer a free trial?
          </AccordionTrigger>
          <AccordionContent>
            Yes! Every new user gets one free safety check - either a chat analysis OR a photo
            verification. After your free check, you'll need to subscribe to continue using HeartGuard.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing">
          <AccordionTrigger className="text-left">
            How much does HeartGuard cost?
          </AccordionTrigger>
          <AccordionContent>
            We offer three subscription tiers:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Basic ($9/mo):</strong> 30 chat analyses, 10 photo verifications</li>
              <li><strong>Plus ($19/mo):</strong> 150 analyses, Guardian Mode, Evidence PDFs</li>
              <li><strong>Family ($29/mo):</strong> Unlimited analyses, family protection</li>
            </ul>
            All plans can be canceled anytime.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacy">
          <AccordionTrigger className="text-left">
            Is my data private and secure?
          </AccordionTrigger>
          <AccordionContent>
            Absolutely. We use end-to-end encryption, secure data storage, and never share your
            personal information with third parties. Your analyses are completely confidential.
            We're committed to zero judgment and 100% privacy.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="accuracy">
          <AccordionTrigger className="text-left">
            How accurate is HeartGuard?
          </AccordionTrigger>
          <AccordionContent>
            Our AI has 95% danger-detection accuracy based on thousands of real-world cases. However,
            HeartGuard is a safety tool, not a guarantee. Always use your own judgment and consider
            multiple sources of information when making decisions about relationships.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guardian-mode">
          <AccordionTrigger className="text-left">
            What is Guardian Mode?
          </AccordionTrigger>
          <AccordionContent>
            Guardian Mode provides real-time monitoring of ongoing conversations. When enabled, you'll
            receive instant alerts if our AI detects sudden trust score drops, manipulation patterns,
            or financial requests. Available on Plus and Family plans.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="family-link">
          <AccordionTrigger className="text-left">
            What is FamilyLink?
          </AccordionTrigger>
          <AccordionContent>
            FamilyLink allows you to add trusted contacts (family members or friends) who will receive
            alerts if you're in a high-risk situation. It's perfect for protecting vulnerable loved ones
            or having a safety net while dating online.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="evidence-locker">
          <AccordionTrigger className="text-left">
            What is the Evidence Locker?
          </AccordionTrigger>
          <AccordionContent>
            The Evidence Locker generates professional PDF reports of your analyses, perfect for
            documenting scams for law enforcement, banks, or legal proceedings. Reports include
            timestamps, trust scores, and detailed risk assessments.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cancel">
          <AccordionTrigger className="text-left">
            Can I cancel my subscription?
          </AccordionTrigger>
          <AccordionContent>
            Yes, you can cancel anytime through your Account Settings or the Stripe billing portal.
            Your subscription will remain active until the end of your current billing period, then
            you'll be downgraded to the free plan.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="refund">
          <AccordionTrigger className="text-left">
            Do you offer refunds?
          </AccordionTrigger>
          <AccordionContent>
            Yes, we offer full refunds within 14 days of purchase if you're not satisfied with our
            service. Contact support@heartguard.app to request a refund.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="delete-account">
          <AccordionTrigger className="text-left">
            How do I delete my account?
          </AccordionTrigger>
          <AccordionContent>
            Go to Account Settings and click "Delete Account." Your account and all associated data
            will be permanently deleted within 30 days. You can also export your data before deletion.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mobile-app">
          <AccordionTrigger className="text-left">
            Is there a mobile app?
          </AccordionTrigger>
          <AccordionContent>
            Currently, HeartGuard is web-only and works great on mobile browsers. We're working on
            native iOS and Android apps - stay tuned!
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="support">
          <AccordionTrigger className="text-left">
            How do I get help or support?
          </AccordionTrigger>
          <AccordionContent>
            Contact us at support@heartguard.app for any questions or issues. Family plan subscribers
            receive priority support with faster response times.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Still have questions?</CardTitle>
          <CardDescription>
            We're here to help
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Email us at <a href="mailto:support@heartguard.app" className="text-primary hover:underline">support@heartguard.app</a>
            {' '}and we'll get back to you within 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
