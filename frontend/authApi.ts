const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
let accessToken: string | null = null;

export function setAccessToken(token: string | null) { accessToken = token; }
export async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API}/auth${path}`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error ?? "Authentication request failed");
  return payload as T;
}
export async function refreshAccessToken(): Promise<string> {
  const result = await authRequest<{ accessToken: string }>("/refresh");
  setAccessToken(result.accessToken);
  return result.accessToken;
}
