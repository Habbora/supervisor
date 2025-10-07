export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export type UserCreate = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
}