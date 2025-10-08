import React from 'react';

interface SubscriptionCardProps {
  title: string;
  price: number;
  period: 'monthly' | 'annual';
  features: string[];
  isPopular?: boolean;
  onSubscribe: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  price,
  period,
  features,
  isPopular = false,
  onSubscribe,
}) => {
  const monthlyPrice = period === 'annual' ? (price / 12).toFixed(2) : price;
  const savings = period === 'annual' ? ((price * 12) - (price * 10)).toFixed(2) : 0;

  return (
    <div className={`relative flex flex-col p-6 bg-white rounded-lg shadow-lg ${isPopular ? 'border-2 border-blue-500' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg">
          Popular
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      
      <div className="mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-600">/{period}</span>
        {period === 'annual' && (
          <div className="text-sm text-gray-500 mt-1">
            ${monthlyPrice}/month (Save ${savings})
          </div>
        )}
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        className={`mt-auto px-6 py-3 rounded-lg font-semibold ${
          isPopular
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        Subscribe Now
      </button>
    </div>
  );
}; 