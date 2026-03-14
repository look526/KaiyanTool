const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 用于防止并发请求的全局变量
let csrfTokenPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  console.log('[CSRF] getCsrfToken called');
  
  // 首先检查 localStorage 中是否已有 token
  const existingToken = localStorage.getItem('csrfToken');
  console.log('[CSRF] existingToken from localStorage:', existingToken ? existingToken.substring(0, 20) + '...' : 'null');
  if (existingToken) {
    return existingToken;
  }
  
  // 如果已经有正在进行的请求，返回该 Promise
  if (csrfTokenPromise) {
    console.log('[CSRF] Reusing existing promise');
    return csrfTokenPromise;
  }
  
  console.log('[CSRF] Fetching new token from server...');
  console.log('[CSRF] API_BASE_URL:', API_BASE_URL);
  
  // 创建新的请求 Promise
  csrfTokenPromise = (async () => {
    try {
      const url = `${API_BASE_URL}/auth/me`;
      console.log('[CSRF] Fetching from:', url);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      console.log('[CSRF] Response status:', response.status);
      console.log('[CSRF] Response headers:', [...response.headers.entries()]);

      const newToken = response.headers.get('X-CSRF-Token') || '';
      console.log('[CSRF] New token from header:', newToken ? newToken.substring(0, 20) + '...' : 'null');
      if (newToken) {
        localStorage.setItem('csrfToken', newToken);
        console.log('[CSRF] Token saved to localStorage');
      }
      return newToken;
    } catch (error) {
      console.error('[CSRF] Failed to fetch CSRF token:', error);
      return '';
    } finally {
      csrfTokenPromise = null;
    }
  })();
  
  return csrfTokenPromise;
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
