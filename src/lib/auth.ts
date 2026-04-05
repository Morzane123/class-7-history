import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { getUserById, User } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "class-7-history-secret-key-2027";

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  role: number;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return null;
    
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const user = await getUserById(decoded.userId);
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role !== undefined && user.role >= 2;
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role !== undefined && user.role >= 3;
}

export function canManageUser(currentUser: AuthUser | null, targetUser: User): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 3) return true;
  if (currentUser.role === 2 && targetUser.role < 2) return true;
  return false;
}
