import { BaseRepository } from './BaseRepository';
import type { User } from '../types/entities';
import type { PaginationOptions, PaginatedResult } from '../types/database';

export class UserRepository extends BaseRepository<User> {
    public create(userData: Omit<User, 'id' | 'is_active' | 'created_at' | 'updated_at'>): User {
        const sql = `
            INSERT INTO users (name, username, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        const result = this.run(sql, [
            userData.name,
            userData.username,
            userData.email,
            userData.password_hash,
            userData.role,
        ]);

        return this.findById(result.lastInsertRowid)!;
    }

    // Buscar por ID
    public findById(id: number): User | null {
        const sql = 'SELECT * FROM users WHERE id = ?';
        return this.get(sql, [id]);
    }

    // Buscar por username
    public findByUsername(username: string): User | null {
        const sql = 'SELECT * FROM users WHERE username = ?';
        return this.get(sql, [username]);
    }

    // Buscar por email
    public findByEmail(email: string): User | null {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return this.get(sql, [email]);
    }

    // Listar todos
    public findAll(): User[] {
        const sql = 'SELECT * FROM users ORDER BY created_at DESC';
        return this.query(sql);
    }

    // Listar com paginação
    public findPaginated(options: PaginationOptions): PaginatedResult<User> {
        const offset = (options.page - 1) * options.limit;
        const orderBy = options.orderBy || 'created_at';
        const orderDirection = options.orderDirection || 'DESC';

        const users = this.query(
            `SELECT * FROM users ORDER BY ${orderBy} ${orderDirection} LIMIT ? OFFSET ?`,
            [options.limit, offset]
        );

        const totalResult = this.get('SELECT COUNT(*) as total FROM users');

        return this.paginate(users, totalResult.total, options);
    }

    // Atualizar
    public update(id: number, userData: Partial<User>): User | null {
        const fields = [];
        const values = [];

        if (userData.username) {
            fields.push('username = ?');
            values.push(userData.username);
        }
        if (userData.email) {
            fields.push('email = ?');
            values.push(userData.email);
        }
        if (userData.password_hash) {
            fields.push('password_hash = ?');
            values.push(userData.password_hash);
        }
        if (userData.role) {
            fields.push('role = ?');
            values.push(userData.role);
        }
        if (userData.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(userData.is_active);
        }

        if (fields.length === 0) {
            throw new Error('Nenhum campo para atualizar');
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        this.run(sql, values);

        return this.findById(id);
    }

    // Deletar
    public delete(id: number): boolean {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = this.run(sql, [id]);
        return result.changes > 0;
    }

    // Verificar se existe
    public exists(username: string): boolean {
        const sql = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
        const result = this.get(sql, [username]);
        return result.count > 0;
    }

    // Buscar por role
    public findByRole(role: string): User[] {
        const sql = 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC';
        return this.query(sql, [role]);
    }

    // Ativar/Desativar usuário
    public toggleActive(id: number): User | null {
        const user = this.findById(id);
        if (!user) return null;

        return this.update(id, { is_active: !user.is_active });
    }
}