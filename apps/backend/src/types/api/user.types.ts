import { z } from "zod";

export const UserRoles = z.enum(['super', 'admin', 'user', 'viewer']);
export type UserRoles = z.infer<typeof UserRoles>;

export const UserResponse = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    username: z.string().min(3).max(50),
    email: z.email().optional(),
    role: UserRoles,
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
})

export type UserResponse = z.infer<typeof UserResponse>;

export const CreateUserDto = z.object({
    name: z.string().min(2).max(100),
    username: z.string().min(3).max(50),
    email: z.email().optional(),
    password: z.string().min(6),
    role: UserRoles.default('user'),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = z.object({
    name: z.string().min(2).max(100).optional(),
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: UserRoles.optional(),
    is_active: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;