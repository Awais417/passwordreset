// API utility functions
import { LoginResponse, setAuth, clearAuth, getToken } from '@/lib/api/auth';

const API_BASE = 'https://nodeapislive.netlify.app';

export interface DiscountCode {
  _id: string;
  code: string;
  description: string;
  discount: number;
  isActive: boolean;
  usedBy: string | null;
  usedAt: string | null;
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

export async function addCode(code: string, discount: number): Promise<DiscountCode> {
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
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

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
    throw new Error(error.message || 'Failed to create admin');
  }

  return await response.json();
}
