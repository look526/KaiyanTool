/** 从 axios / fetch 等错误中取出可读文案 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const response = e.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | string | undefined;
    if (data && typeof data === 'object') {
      const err = data.error as Record<string, unknown> | undefined;
      const m =
        (typeof err?.message === 'string' && err.message) ||
        (typeof data.message === 'string' && data.message);
      if (m && String(m).trim()) return String(m);
    }
    if (typeof data === 'string' && data.trim()) return data;
    const msg = e.message;
    if (typeof msg === 'string' && msg && !/^Request failed with status/.test(msg)) return msg;
  }
  if (error instanceof Error && error.message && !/^Request failed with status/.test(error.message)) {
    return error.message;
  }
  return fallback;
}
