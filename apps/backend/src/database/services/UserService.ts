import { UserRepository } from '../repositories/UserRepository';
import type { User } from '../types/entities';
import type { PaginationOptions, PaginatedResult } from '../types/database';
import { CreateUserDto, UserResponse } from '@/types/api/user.types';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async createUser(userData: CreateUserDto): Promise<UserResponse> {
        const validatedUserData = CreateUserDto.parse(userData);

        if (this.userRepository.exists(validatedUserData.username)) {
            throw new Error('Usuário ou email já existe');
        }

        if (!this.isValidPassword(validatedUserData.password)) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        const { password, ...userDataWithoutPassword } = validatedUserData;
        const passwordHash = await Bun.password.hash(password);
        const userWithPasswordHash = { ...userDataWithoutPassword, password_hash: passwordHash };
        const { password_hash, ...newUser } = this.userRepository.create(userWithPasswordHash);
        console.log(newUser);
        const userResponse = UserResponse.parse(newUser);
        return userResponse;
    }

    // Buscar usuário por ID
    public getUserById(id: number): User | null {
        return this.userRepository.findById(id);
    }

    // Buscar usuário por username
    public getUserByUsername(username: string): User | null {
        return this.userRepository.findByUsername(username);
    }

    // Buscar usuário por email
    public getUserByEmail(email: string): Omit<User, 'password_hash'> | null {
        return this.userRepository.findByEmail(email);
    }

    public getAllUsers(): Omit<User, 'password_hash'>[] {
        const users = this.userRepository.findAll();
        const usersWithoutPassword = users.map(user => {
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return usersWithoutPassword;
    }

    // Listar com paginação
    public getUsersPaginated(options: PaginationOptions): PaginatedResult<User> {
        return this.userRepository.findPaginated(options);
    }

    // Atualizar usuário
    public updateUser(id: number, userData: Partial<User>): User | null {
        const existingUser = this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error('Usuário não encontrado');
        }

        // Validações para atualização
        if (userData.email && userData.email !== existingUser.email) {
            if (this.userRepository.findByEmail(userData.email)) {
                throw new Error('Email já está em uso');
            }
        }

        if (userData.username && userData.username !== existingUser.username) {
            if (this.userRepository.findByUsername(userData.username)) {
                throw new Error('Username já está em uso');
            }
        }

        return this.userRepository.update(id, userData);
    }

    // Deletar usuário
    public deleteUser(id: number): boolean {
        const existingUser = this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error('Usuário não encontrado');
        }

        return this.userRepository.delete(id);
    }

    // Ativar/Desativar usuário
    public toggleUserActive(id: number): User | null {
        return this.userRepository.toggleActive(id);
    }

    // Buscar usuários por role
    public getUsersByRole(role: string): User[] {
        return this.userRepository.findByRole(role);
    }

    // Validações privadas
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidPassword(password: string): boolean {
        return password.length >= 6;
    }
}       