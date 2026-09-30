export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
}

export type Role = "CUSTOMER" | "ADMIN" | "SELLER";

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
}
