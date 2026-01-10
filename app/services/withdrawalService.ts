/**
 * Withdrawal Service - API integration for commission withdrawal system
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export interface WithdrawalRequest {
  amount: number;
  bankAccount: string;
  bankName: string;
  accountHolderName: string;
  accountType: 'checking' | 'savings';
  routingNumber: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'success' | 'failed' | 'rejected';
  bankAccount: string;
  bankName: string;
  accountHolderName: string;
  accountType: string;
  routingNumber: string;
  requestedAt: string;
  processedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  failureReason?: string;
  stripeTransferId?: string;
  transactionId?: string;
  paymentProviderResponse?: string;
  processedBy?: string;
  statusDescription?: string;
  estimatedCompletionTime?: string;
  canCancel?: boolean;
  canRetry?: boolean;
  progress?: number;
  influencer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Commission {
  id: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
  promoCode?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface StripeAccountStatus {
  setup: boolean;
  details?: {
    id: string;
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
  };
}

export interface StripeAccountResponse {
  accountId: string;
  accountLink: {
    url: string;
  };
}

class WithdrawalService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Influencer API Methods
  async getInfluencerProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/influencer/profile`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get profile: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getInfluencerCommissions(token: string): Promise<Commission[]> {
    const response = await fetch(`${API_BASE_URL}/influencer/commissions`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get commissions: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getInfluencerWithdrawals(token: string): Promise<Withdrawal[]> {
    const response = await fetch(`${API_BASE_URL}/influencer/withdrawals`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get withdrawals: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getWithdrawalStatus(token: string, withdrawalId: string): Promise<Withdrawal> {
    const response = await fetch(`${API_BASE_URL}/influencer/withdrawals/${withdrawalId}`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get withdrawal status: ${response.statusText}`);
    }
    
    return response.json();
  }

  async requestWithdrawal(token: string, withdrawalData: WithdrawalRequest): Promise<Withdrawal> {
    const response = await fetch(`${API_BASE_URL}/influencer/withdrawals`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(withdrawalData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to request withdrawal: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getInfluencerPromoCodes(token: string) {
    const response = await fetch(`${API_BASE_URL}/influencer/promo-codes`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get promo codes: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createStripeAccount(token: string): Promise<StripeAccountResponse> {
    const response = await fetch(`${API_BASE_URL}/influencer/stripe-account`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create Stripe account: ${response.statusText}`);
    }
    
    return response.json();
  }

  async checkStripeAccountStatus(token: string): Promise<StripeAccountStatus> {
    const response = await fetch(`${API_BASE_URL}/influencer/stripe-account/status`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check Stripe status: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Admin API Methods
  async getAdminWithdrawals(token: string): Promise<Withdrawal[]> {
    const response = await fetch(`${API_BASE_URL}/admin/withdrawals`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get admin withdrawals: ${response.statusText}`);
    }
    
    return response.json();
  }

  async approveWithdrawal(token: string, withdrawalId: string): Promise<Withdrawal> {
    const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to approve withdrawal: ${response.statusText}`);
    }
    
    return response.json();
  }

  async rejectWithdrawal(token: string, withdrawalId: string, reason: string): Promise<Withdrawal> {
    const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to reject withdrawal: ${response.statusText}`);
    }
    
    return response.json();
  }

  async processWithdrawal(token: string, withdrawalId: string): Promise<Withdrawal> {
    const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${withdrawalId}/process`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to process withdrawal: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAllInfluencers(token: string) {
    const response = await fetch(`${API_BASE_URL}/admin/influencers`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get influencers: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getPendingInfluencers(token: string) {
    const response = await fetch(`${API_BASE_URL}/admin/influencers/pending`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get pending influencers: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateInfluencerStatus(token: string, influencerId: string, status: 'pending' | 'approved' | 'rejected') {
    const response = await fetch(`${API_BASE_URL}/admin/influencers/${influencerId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update influencer status: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Promo Code API Methods
  async validatePromoCode(code: string, orderAmount: number) {
    const response = await fetch(`${API_BASE_URL}/promo-codes/validate/${code}?orderAmount=${orderAmount}`);
    
    if (!response.ok) {
      throw new Error(`Failed to validate promo code: ${response.statusText}`);
    }
    
    return response.json();
  }

  async usePromoCode(code: string, orderAmount?: number) {
    const response = await fetch(`${API_BASE_URL}/promo-codes/use/${code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderAmount }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to use promo code: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const withdrawalService = new WithdrawalService();

