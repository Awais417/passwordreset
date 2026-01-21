// API utility functions
import { LoginResponse, setAuth, clearAuth, getToken } from '@/lib/api/auth';

const API_BASE = 'https://nodeapislive.netlify.app';

export interface DiscountCode {
  _id: string;
  code: string;
  description: string;
  discount: number;
  totalAmount?: number;
  walletAmount?: number;
  isActive: boolean;
  usedBy: { _id: string; username?: string; email?: string; userType?: string } | null;
  usedAt: string | null;
  assignedTo?: { _id: string; username?: string; email?: string; userType?: string } | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CodesResponse {
  message: string;
  codes: DiscountCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  setAuth(data.token, data.user);
  return data;
}

export async function fetchCodes(): Promise<CodesResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/codes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch codes' }));
    throw new Error(error.message || 'Failed to fetch codes');
  }

  return await response.json();
}

export async function addCode(code: string, discount: number, walletUserId?: string, walletAmount?: number): Promise<DiscountCode> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/codes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      discount,
      walletUserId,
      walletAmount,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add code' }));
    throw new Error(error.message || 'Failed to add code');
  }

  const data = await response.json();
  return data;
}

export async function deleteCode(codeId: string, code: string, discount: number): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Delete endpoint uses different base URL
  const DELETE_API_BASE = 'https://serverapis.vercel.app';
  
  const response = await fetch(`${DELETE_API_BASE}/codes/${codeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      discount,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete code' }));
    throw new Error(error.message || 'Failed to delete code');
  }
}


export interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateAdminResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    userType: string;
  };
}

export async function createAdmin(username: string, email: string, password: string): Promise<CreateAdminResponse> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
      userType: 'admin',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create admin' }));
    throw new Error(error.message || error.error?.message || 'Failed to create admin');
  }

  return await response.json();
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminsResponse {
  message: string;
  admins: Admin[];
  total: number;
}

export async function fetchAdmins(): Promise<AdminsResponse> {
  const response = await fetch(`${API_BASE}/auth/admins`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch admins' }));
    throw new Error(error.message || error.error?.message || 'Failed to fetch admins');
  }

  return await response.json();
}

export async function deleteAdmin(adminId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/admins/${adminId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete admin' }));
    throw new Error(error.message || error.error?.message || 'Failed to delete admin');
  }
}

export interface WalletUser {
  id: string;
  username: string;
  email: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletUsersResponse {
  message: string;
  users: WalletUser[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function fetchWalletUsers(search?: string): Promise<WalletUsersResponse> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE}/auth/wallet-users?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch wallet users' }));
    throw new Error(error.message || error.error?.message || 'Failed to fetch wallet users');
  }

  return await response.json();
}

export interface CreateWalletUserResponse {
  message: string;
  user: WalletUser;
}

export async function createWalletUser(username: string, email: string, password: string): Promise<CreateWalletUserResponse> {
  const response = await fetch(`${API_BASE}/auth/wallet-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create wallet user' }));
    throw new Error(error.message || error.error?.message || 'Failed to create wallet user');
  }

  return await response.json();
}

export async function deleteWalletUser(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/wallet-users/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete wallet user' }));
    throw new Error(error.message || error.error?.message || 'Failed to delete wallet user');
  }
}

export interface WalletSummary {
  userId: string;
  username: string;
  email: string;
  currency: string;
  balance: number;
  totalSales: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface WalletTxn {
  id: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  currency: string;
  paidAmount: number | null;
  code: { id: string | null; code: string; discount: number; walletAmount: number } | null;
  sourceUser: { id: string; username: string; email: string } | null;
  createdAt: string;
}

export interface GetMyWalletResponse {
  message: string;
  wallet: WalletSummary;
  transactions: WalletTxn[];
}

export async function fetchMyWallet(userId: string): Promise<GetMyWalletResponse> {
  const params = new URLSearchParams({ userId });
  const response = await fetch(`${API_BASE}/wallet/me?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch wallet' }));
    throw new Error(error.message || error.error?.message || 'Failed to fetch wallet');
  }

  return await response.json();
}

export interface RequestWithdrawResponse {
  message: string;
  withdrawal: { id: string; amount: number; status: string };
  balance: number;
}

export async function requestWithdraw(userId: string, amount: number): Promise<RequestWithdrawResponse> {
  const response = await fetch(`${API_BASE}/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to request withdrawal' }));
    throw new Error(error.message || error.error?.message || 'Failed to request withdrawal');
  }

  return await response.json();
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  changes: {
    users: string;
    subscriptions: string;
    revenue: string;
    monthlyRevenue: string;
  };
}

export interface AdminStatsResponse {
  message: string;
  stats: AdminStats;
}

export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch stats' }));
      throw new Error(error.message || error.error?.message || 'Failed to fetch stats');
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to reach the server. Please check your connection and ensure the API is running.');
    }
    throw error;
  }
}

export interface Activity {
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

export interface RecentActivityResponse {
  message: string;
  activities: Activity[];
}

export async function fetchRecentActivity(): Promise<RecentActivityResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/recent-activity`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch activity' }));
      throw new Error(error.message || error.error?.message || 'Failed to fetch activity');
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to reach the server. Please check your connection and ensure the API is running.');
    }
    throw error;
  }
}

export interface User {
  id: string;
  username: string;
  email: string;
  paymentStatus: boolean;
  subscriptionStatus: string;
  subscriptionExpiryDate: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  message: string;
  users: User[];
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    freeUsers: number;
    newThisMonth: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function fetchUsers(search?: string): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  
  const response = await fetch(`${API_BASE}/auth/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
    throw new Error(error.message || error.error?.message || 'Failed to fetch users');
  }

  return await response.json();
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export async function createUser(username: string, email: string, password: string): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE}/auth/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create user' }));
    throw new Error(error.message || error.error?.message || 'Failed to create user');
  }

  return await response.json();
}

export interface UpdateUserRequest {
  paymentStatus?: boolean;
  subscriptionStatus?: string;
  subscriptionExpiryDate?: string | null;
  paymentDate?: string | null;
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

export async function updateUser(userId: string, updates: UpdateUserRequest): Promise<UpdateUserResponse> {
  const response = await fetch(`${API_BASE}/auth/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update user' }));
    throw new Error(error.message || error.error?.message || 'Failed to update user');
  }

  return await response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
    throw new Error(error.message || error.error?.message || 'Failed to delete user');
  }
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    userType: string;
    updatedAt: string;
  };
}

export async function updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      ...updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(error.message || error.error?.message || 'Failed to update profile');
  }

  return await response.json();
}

export interface Lead {
  id: string;
  email: string;
  source: string;
  subscribed: boolean;
  emailSent: boolean;
  emailSentAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsResponse {
  message: string;
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeadResponse {
  message: string;
  lead: Lead;
}

export async function fetchLeads(search?: string, subscribed?: boolean, source?: string): Promise<LeadsResponse> {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  if (subscribed !== undefined) {
    params.append('subscribed', subscribed.toString());
  }
  if (source) {
    params.append('source', source);
  }
  
  const response = await fetch(`${API_BASE}/leads?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch leads' }));
    throw new Error(error.message || error.error?.message || 'Failed to fetch leads');
  }

  return await response.json();
}

export async function getLeadById(leadId: string): Promise<LeadResponse> {
  const response = await fetch(`${API_BASE}/leads/${leadId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch lead' }));
    throw new Error(error.message || error.error?.message || 'Failed to fetch lead');
  }

  return await response.json();
}

export interface UpdateLeadRequest {
  email?: string;
  source?: string;
  subscribed?: boolean;
  notes?: string;
  resendEmail?: boolean;
}

export interface UpdateLeadResponse {
  message: string;
  lead: Lead;
}

export async function updateLead(leadId: string, updates: UpdateLeadRequest): Promise<UpdateLeadResponse> {
  const response = await fetch(`${API_BASE}/leads/${leadId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update lead' }));
    throw new Error(error.message || error.error?.message || 'Failed to update lead');
  }

  return await response.json();
}

export async function deleteLead(leadId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/leads/${leadId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete lead' }));
    throw new Error(error.message || error.error?.message || 'Failed to delete lead');
  }
}
