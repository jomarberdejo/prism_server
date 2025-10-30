export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: string | number | boolean;
}
