import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Subscription Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for subscribing to Roster Monster. Your account has been upgraded successfully.
            </p>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What's Next?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-green-500 mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Access Premium Features
                    </h3>
                    <p className="text-gray-600">
                      You now have access to all premium features of your plan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-green-500 mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Manage Your Subscription
                    </h3>
                    <p className="text-gray-600">
                      You can manage your subscription settings in your account dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-green-500 mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Get Started
                    </h3>
                    <p className="text-gray-600">
                      Start using your new features right away.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Subscription Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}