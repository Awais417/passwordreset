import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PaymentStatusResponse,
  VerifySessionRequest,
  VerifySessionResponse,
} from "@/types/user";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://serverapis.vercel.app";

/**
 * Creates a Stripe checkout session
 */
export async function createCheckoutSession(
  data: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: data.userId,
      amount: data.amount,
      currency: data.currency || "usd",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || "Failed to create checkout session. Please try again."
    );
  }

  return response.json();
}

/**
 * Gets the payment status for a user
 */
export async function getPaymentStatus(
  userId: string
): Promise<PaymentStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/payment/status/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || "Failed to get payment status. Please try again."
    );
  }

  return response.json();
}

/**
 * Verifies a payment session after redirect from Stripe
 */
export async function verifySession(
  data: VerifySessionRequest
): Promise<VerifySessionResponse> {
  const response = await fetch(`${API_BASE_URL}/payment/verify-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: data.sessionId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || "Failed to verify session. Please try again."
    );
  }

  return response.json();
}


