import { BaseRepository } from "./BaseRepository";
import { type Logger } from "../types/logger";
import type { PaginatedResult, PaginationOptions } from "../types/database";

export class LoggerRepository extends BaseRepository<Logger> {
    public create(loggerData: Omit<Logger, 'id' | 'timestamp'>): Logger {
        const sql = `
            INSERT INTO loggers (module, level, message)
            VALUES (?, ?, ?)
        `;

        const result = this.run(sql, [loggerData.module, loggerData.level, loggerData.message]);

        return this.findById(result.lastInsertRowid)!;
    }

    public findWithPagination(
        pagination: PaginationOptions,
        filters: any = {}
    ): PaginatedResult<Logger> {
        const { page, limit, orderBy, orderDirection } = pagination;
        const { module, level, startDate, endDate, search } = filters;

        const whereConditions: string[] = [];
        const queryParams: any[] = [];

        if (module) {
            whereConditions.push('module = ?');
            queryParams.push(module);
        }

        if (level) {
            whereConditions.push('level = ?');
            queryParams.push(level);
        }

        if (startDate) {
            whereConditions.push('timestamp >= ?');
            queryParams.push(startDate);
        }

        if (endDate) {
            whereConditions.push('timestamp <= ?');
            queryParams.push(endDate);
        }

        if (search) {
            whereConditions.push('message LIKE ?');
            queryParams.push(`%${search}%`);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const countSql = `SELECT COUNT(*) as total FROM loggers ${whereClause}`;
        const totalResult = this.get(countSql, queryParams);
        const total = totalResult?.total || 0;

        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const dataSql = `
            SELECT * FROM loggers 
            ${whereClause}
            ORDER BY ${orderBy} ${orderDirection?.toUpperCase() || 'DESC'}
            LIMIT ? OFFSET ?
        `;

        const data = this.query(dataSql, [...queryParams, limit, offset]);

        const meta = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };

        return {
            data: data as Logger[],
            limit,
            total,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    public findAll(): Logger[] {
        const sql = `
            SELECT * FROM loggers
        `;
        return this.query(sql);
    }

    public findById(id: number): Logger | null {
        const sql = `
            SELECT * FROM loggers WHERE id = ?
        `;
        return this.get(sql, [id]);
    }

    public findByModule(module: string): Logger[] {
        const sql = `
            SELECT * FROM loggers WHERE module = ?
        `;
        return this.query(sql, [module]);
    }

    public findByLevel(level: string): Logger[] {
        const sql = `
            SELECT * FROM loggers WHERE level = ?
        `;
        return this.query(sql, [level]);
    }

    public findByTimeRange(startDate: string, endDate: string): Logger[] {
        const sql = `
            SELECT * FROM loggers WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC
        `;
        return this.query(sql, [startDate, endDate]);
    }
}