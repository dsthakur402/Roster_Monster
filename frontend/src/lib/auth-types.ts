import { User } from "firebase/auth"

export type UserRole = "owner" | "editor" | "user"

export interface AppUser extends User {
  role: UserRole
  canEditRoster: boolean
  department?: string
  isOwner?: boolean
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  isAdmin: boolean
  isOwner: boolean
  canEditRoster: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, isOwner?: boolean) => Promise<void>
  signOut: () => Promise<void>
}