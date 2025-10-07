import { DatabaseConnection } from '../connection.ts';
import type { PaginatedResult, PaginationOptions } from '../types/database.ts';

export abstract class BaseRepository<T> {
    protected db = DatabaseConnection.getInstance().getDatabase();

    protected query(sql: string, params: any[] = []): any[] {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.all(...params);
        } catch (error) {
            console.error('Erro na query:', error);
            throw error;
        }
    }

    // Método para executar uma única operação
    protected run(sql: string, params: any[] = []): any {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.run(...params);
        } catch (error) {
            console.error('Erro na execução:', error);
            throw error;
        }
    }

    // Método para buscar um único registro
    protected get(sql: string, params: any[] = []): any {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.get(...params);
        } catch (error) {
            console.error('Erro na busca:', error);
            throw error;
        }
    }

    // Método para paginação
    protected paginate<T>(
        data: T[],
        total: number,
        options: PaginationOptions
    ): PaginatedResult<T> {
        const totalPages = Math.ceil(total / options.limit);

        return {
            data,
            total,
            page: options.page,
            limit: options.limit,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrev: options.page > 1,
        };
    }

    // Método para executar transações
    protected transaction(queries: Array<{ sql: string, params: any[] }>): any[] {
        try {
            const results = [];
            this.db.exec("BEGIN TRANSACTION");

            for (const query of queries) {
                const stmt = this.db.prepare(query.sql);
                const result = stmt.run(...query.params);
                results.push(result);
            }

            this.db.exec("COMMIT");
            return results;
        } catch (error) {
            this.db.exec("ROLLBACK");
            console.error('Erro na transação:', error);
            throw error;
        }
    }
}