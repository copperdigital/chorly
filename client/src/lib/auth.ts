import { apiRequest } from "./queryClient";

export interface AuthSession {
  household: any;
  member: any;
}

export async function authenticateHousehold(name: string): Promise<AuthSession> {
  const res = await apiRequest("POST", "/api/auth/household", { name });
  return res.json();
}

export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  const res = await apiRequest("POST", "/api/auth/login", { email, password });
  return res.json();
}

export async function registerHousehold(name: string, email: string, password: string, adminPin?: string): Promise<AuthSession> {
  const res = await apiRequest("POST", "/api/auth/register", { name, email, password, adminPin: adminPin || "1234" });
  return res.json();
}

export async function selectMember(memberId: number | null): Promise<void> {
  await apiRequest("POST", "/api/auth/member", { memberId });
}

export async function authenticateAdmin(pin: string): Promise<void> {
  await apiRequest("POST", "/api/auth/admin", { pin });
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const res = await apiRequest("GET", "/api/session");
    return res.json();
  } catch (error) {
    return null;
  }
}
