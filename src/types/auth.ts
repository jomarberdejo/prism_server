export interface UserPayload {
  id: string;
  username: string;
  role: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  [key: string]: string | number | boolean;
}
