import { Database } from "bun:sqlite";

export interface DatabaseQueryResult {
    success: boolean;
    data?: any;
    error?: string;
    lastInsertRowId?: number;
    changes?: number;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
    data: T[];
    limit: number;
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export type DatabaseInstance = Database;