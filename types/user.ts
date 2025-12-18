/**
 * User model type matching the backend User schema
 */
export interface User {
  id: string;
  username: string;
  email: string;
  paymentStatus: boolean;
  stripeCustomerId?: string | null;
  paymentDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payment status response from the API
 */
export interface PaymentStatusResponse {
  message: string;
  user: User;
}

/**
 * Create checkout session request payload
 */
export interface CreateCheckoutSessionRequest {
  userId: string;
  amount: number;
  currency?: string;
  couponCode?: string;
}

/**
 * Validate coupon request
 */
export interface ValidateCouponRequest {
  code: string;
}

/**
 * Validate coupon response
 */
export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  coupon?: {
    code: string;
    discount: number;
    description: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Create checkout session response
 */
export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Verify session request payload
 */
export interface VerifySessionRequest {
  sessionId: string;
}

/**
 * Verify session response
 */
export interface VerifySessionResponse {
  success: boolean;
  message: string;
  user?: User;
}


