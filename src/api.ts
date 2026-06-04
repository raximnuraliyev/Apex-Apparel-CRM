const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('apex_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred.' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ─── Auth ───
export async function apiLogin(email: string, password: string) {
  const data = await request<{ token: string; user: { _id: string; username: string; email: string; role: string } }>(
    '/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );
  localStorage.setItem('apex_token', data.token);
  return data;
}

// ─── Clients ───
export async function apiGetClients() {
  return request<any[]>('/clients');
}

export async function apiCreateClient(clientData: {
  company: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  status: string;
}) {
  return request<any>('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
}

// ─── Orders ───
export async function apiGetOrders() {
  return request<any[]>('/orders');
}

export async function apiCreateOrder(orderData: {
  clientId: string;
  clientName: string;
  companyName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  status: string;
  totalAmount: number;
  note?: string;
}) {
  return request<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function apiUpdateOrderStatus(
  orderId: string,
  updateData: {
    status: string;
    shippingCarrier?: string;
    trackingNumber?: string;
  }
) {
  return request<any>(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

// ─── Dashboard ───
export async function apiGetDashboard() {
  return request<any>('/dashboard');
}
