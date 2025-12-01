export type UserRoleValue = 'super' | 'admin' | 'user' | 'viewer';

export const UserRoles: Record<string, string> = {
  'super': 'Super Adm.',
  'admin': 'Administrador',
  'user': 'Supervisor',
  'viewer': 'Operador'
} as const;

export type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRoleValue
  createdAt: string;
  updatedAt: string;
}

export type UserCreate = {
  name: string;
  username: string;
  email?: string;
  password: string;
  role: UserRoleValue
}

export type UserUpdate = {
  name: string;
  email?: string;
  password?: string;
  role: UserRoleValue
}