'use client';

import { useState } from 'react';
import { withdrawalService } from '../services/withdrawalService';
import { CheckCircle, XCircle, Loader2, Gift } from 'lucide-react';

interface PromoData {
  code: string;
  discountAmount: number;
  discountType: string;
  discountValue: number;
  commissionAmount: number;
  used?: boolean;
}

interface PromoCodeValidatorProps {
  onPromoCodeUsed?: (promoData: PromoData) => void;
  orderAmount?: number;
}

export default function PromoCodeValidator({ onPromoCodeUsed, orderAmount = 0 }: PromoCodeValidatorProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PromoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const result = await withdrawalService.validatePromoCode(promoCode.trim(), orderAmount);
      setValidationResult(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid promo code';
      setError(errorMessage);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const usePromoCode = async () => {
    if (!validationResult) return;

    setIsValidating(true);
    try {
      const result = await withdrawalService.usePromoCode(promoCode.trim(), orderAmount);
      setValidationResult({ ...validationResult, used: true });
      onPromoCodeUsed?.(result);
      alert('✅ Promo code applied successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use promo code';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const reset = () => {
    setPromoCode('');
    setValidationResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Gift className="w-5 h-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Promo Code</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Promo Code
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your promo code"
              disabled={isValidating || validationResult?.used}
            />
            <button
              onClick={validatePromoCode}
              disabled={isValidating || !promoCode.trim() || validationResult?.used}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Validate'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Invalid Promo Code</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {validationResult && !validationResult.used && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">Valid Promo Code!</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Code:</span> {validationResult.code}
                  </p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Discount:</span> {validationResult.discountType === 'percentage' 
                      ? `${validationResult.discountValue}%` 
                      : `£${validationResult.discountValue}`}
                  </p>
                  {validationResult.discountAmount > 0 && (
                    <p className="text-sm text-green-700">
                      <span className="font-medium">You Save:</span> £{validationResult.discountAmount.toFixed(2)}
                    </p>
                  )}
                  {validationResult.commissionAmount > 0 && (
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Commission:</span> £{validationResult.commissionAmount.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={usePromoCode}
                  disabled={isValidating}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Apply Promo Code'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {validationResult?.used && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Promo Code Applied!</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your promo code has been successfully applied to your order.
                </p>
              </div>
            </div>
          </div>
        )}

        {(validationResult || error) && (
          <button
            onClick={reset}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Try another promo code
          </button>
        )}
      </div>
    </div>
  );
}

