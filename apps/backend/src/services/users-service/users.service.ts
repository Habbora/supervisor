import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';
import { UserNotFoundError, UserAlreadyExistsError, InvalidCredentialsError } from './err';
import type { CreateUserDTO, UpdateUserDTO, SafeUser } from './types';

// ═══════════════════════════════════════════════════════════════════
// USER SERVICE
// ═══════════════════════════════════════════════════════════════════

class UserService {
    // ───────────────────────────────────────────────────────────────
    // CREATE
    // ───────────────────────────────────────────────────────────────

    async create(data: CreateUserDTO): Promise<SafeUser> {
        // Verificar se já existe usuário com este email
        const existingUser = await this.findByUsername(data.username);
        if (existingUser) {
            throw new UserAlreadyExistsError(data.username);
        }

        // Hash da senha
        const passwordHash = await Bun.password.hash(data.password);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                password: passwordHash,
                role: data.role || 'user',
            },
        });

        // Retornar sem a senha
        return this.excludePassword(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────

    async findAll(): Promise<SafeUser[]> {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return users.map(user => this.excludePassword(user));
    }

    async findById(id: string): Promise<SafeUser | null> {
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return this.excludePassword(user);
    }

    async findByUsername(username: string): Promise<SafeUser | null> {
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) return null

        return this.excludePassword(user)
    }

    // ─────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────

    async update(id: string, data: UpdateUserDTO): Promise<SafeUser> {
        // Verificar se usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new UserNotFoundError(id);
        }

        const updateData: UpdateUserDTO = {
            name: data.name,
            password: data.password ? Bun.password.hashSync(data.password) : undefined,
            role: data.role,
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return this.excludePassword(updatedUser);
    }

    // ─────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────

    async delete(id: string): Promise<SafeUser> {
        // Verificar se usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new UserNotFoundError(id);
        }

        // Deletar usuário
        const deletedUser = await prisma.user.delete({
            where: { id },
        });

        return this.excludePassword(deletedUser);
    }

    // Método interno para buscar com senha (usado para autenticação)
    private async findByUsernameWithPassword(username: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { username },
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // AUTHENTICATION
    // ─────────────────────────────────────────────────────────────────

    async validateCredentials(username: string, password: string): Promise<SafeUser> {
        // Buscar usuário com senha
        const user = await this.findByUsernameWithPassword(username);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Verificar senha
        const isValidPassword = await Bun.password.verify(password, user.password);

        if (!isValidPassword) {
            throw new InvalidCredentialsError();
        }

        return this.excludePassword(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────

    private excludePassword(user: User): SafeUser {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════

export const userService = new UserService();
