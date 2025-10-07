import { User } from "../entities/User";

export type LoginRequest = {
  username: string;
  password: string;
}

export type LoginResponse = {
  user: User;
  token: string;
  refreshToken?: string;
}

export type ValidateTokenResponse = LoginResponse;

export type CreateUserRequest = {
  name: string;
  username: string;
  email?: string;
  password: string;
  role: string;
}

export type CreateUserResponse = {
  user: User;
}

export type ReadUsersResponse = {
  users: User[];
}

export type ReadUserByIdResponse = {
  user: User;
}

export type UpdateUserRequest = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
}

export type UpdateUserResponse = {
  user: User;
}

export type DeleteUserRequest = {
  id: string;
}

export type DeleteUserResponse = {
  user: User;
}