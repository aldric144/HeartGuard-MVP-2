/**
 * Auth API Helpers
 * Connects to backend auth endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user_id?: number;
  email?: string;
  session_token?: string;
  message?: string;
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('first_name', data.firstName);
  formData.append('last_name', data.lastName);

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append('email', email);

  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to send reset email');
  }

  return response.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append('token', token);
  formData.append('new_password', newPassword);

  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to reset password');
  }

  return response.json();
}

export async function logoutUser(sessionToken: string): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append('session_token', sessionToken);

  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return response.json();
}

export async function verifySession(sessionToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/verify-session?session_token=${sessionToken}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Session invalid');
  }

  return response.json();
}
