import React, { useState, useCallback } from 'react';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';

interface SubscriptionPlan {
  id: string;
  title: string;
  price: number;
  period: 'monthly' | 'annual';
  features: string[];
  isPopular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    title: 'Basic',
    price: 9.99,
    period: 'monthly',
    features: [
      'Up to 5 staff members',
      'Basic scheduling features',
      'Email support',
      'Basic reporting',
    ],
  },
  {
    id: 'pro',
    title: 'Professional',
    price: 19.99,
    period: 'monthly',
    features: [
      'Up to 20 staff members',
      'Advanced scheduling',
      'Priority support',
      'Advanced reporting',
      'API access',
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: 49.99,
    period: 'monthly',
    features: [
      'Unlimited staff members',
      'Custom scheduling rules',
      '24/7 support',
      'Custom reporting',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Razorpay, isLoading } = useRazorpay();

  const handleSubscribe = useCallback(async (plan: SubscriptionPlan) => {
    if (isLoading) {
      setError('Payment gateway is not ready yet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth('/api/subscriptions/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          period: plan.period,
          amount: plan.price * 100,
          currency: 'USD',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription order');
      }

      const { orderId, keyId } = await response.json();

      const options: RazorpayOrderOptions = {
        key: keyId,
        amount: plan.price * 100,
        currency: 'USD' as const,
        name: 'Roster Monster',
        description: `${plan.title} Plan - ${plan.period}`,
        order_id: orderId,
        handler: async function (response: any) {
          const verifyResponse = await fetchWithAuth('/api/subscriptions/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          window.location.href = '/subscription/success';
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp1 = new Razorpay(options);

      rzp1.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
      });

      rzp1.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [Razorpay, isLoading, user]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Select the perfect plan for your organization
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                isPopular={plan.isPopular}
                onSubscribe={() => handleSubscribe(plan)}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}