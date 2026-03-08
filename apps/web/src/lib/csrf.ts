const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getCsrfToken(): Promise<string> {
  try {
    // 直接发送GET请求到一个不需要认证的路径来获取CSRF token
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    // 即使响应状态不是200，也尝试从响应头获取CSRF token
    const newToken = response.headers.get('X-CSRF-Token') || '';
    if (newToken) {
      localStorage.setItem('csrfToken', newToken);
    }
    return newToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    // 尝试从localStorage获取作为备用
    return localStorage.getItem('csrfToken') || '';
  }
}

export function clearCsrfToken(): void {
  localStorage.removeItem('csrfToken');
}

export function setCsrfToken(token: string): void {
  localStorage.setItem('csrfToken', token);
}

export async function refreshCsrfToken(): Promise<string> {
  clearCsrfToken();
  return getCsrfToken();
}
