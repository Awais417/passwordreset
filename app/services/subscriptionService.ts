const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';

// Helper function to get loading context
let loadingContext: any = null;
export const setLoadingContext = (context: any) => {
  loadingContext = context;
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  isSubscription: boolean;
  billingInterval: string;
  trialPeriodDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptions: Subscription[];
}

export interface CheckoutSession {
  url: string;
}

class SubscriptionService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data]; // Handle single product response
  }

  async getUserSubscriptions(): Promise<Subscription[]> {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/status`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    return response.json();
  }

  async createCheckoutSession(productId: string): Promise<CheckoutSession> {
    if (loadingContext) loadingContext.setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      return response.json();
    } finally {
      if (loadingContext) loadingContext.setLoading(false);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  }

  async verifyPayment(sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/stripe/verify-payment?session_id=${sessionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return response.json();
  }

  // Helper method to format price
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Helper method to get subscription status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'trialing':
        return 'text-blue-500';
      case 'past_due':
        return 'text-yellow-500';
      case 'canceled':
        return 'text-red-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  }
}

export const subscriptionService = new SubscriptionService();
