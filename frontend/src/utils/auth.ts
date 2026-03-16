import { authService, type AuthRole, type SessionUser } from "@/services/authService";

export type User = {
  role: AuthRole;
  name?: string;
  roll?: string;
  id?: string;
};

export function setUser(user: User) {
  const current = authService.getStoredSession();
  if (!current) return;

  const merged: SessionUser = {
    ...current,
    role: user.role,
    name: user.name ?? current.name,
    rollNumber: user.roll ?? current.rollNumber,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem("lkd_web_session_v1", JSON.stringify(merged));
  }
}

export function getUser(): User | null {
  const session = authService.getStoredSession();
  if (!session) return null;
  return {
    id: session.id,
    role: session.role,
    name: session.name,
    roll: session.rollNumber ?? undefined,
  };
}

export function logout() {
  void authService.logout();
}
