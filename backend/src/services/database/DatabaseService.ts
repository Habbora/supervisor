import fs from 'fs';
import path from 'path';
import { BaseService } from '../abstracts/BaseService';

export class DatabaseService extends BaseService {
    private dataDir: string;

    constructor() {
        super('DatabaseService');
        this.dataDir = path.join(process.cwd(), 'data');
        this.ensureDataDirectory();
    }

    async initialize(): Promise<this> {
        this.ensureDataDirectory();
        return this;
    }

    async destroy(): Promise<void> {
        await super.destroy();
    }

    private ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private getCollectionPath(collection: string): string {
        return path.join(this.dataDir, `${collection}.json`);
    }

    private readCollection(collection: string): any[] {
        const filePath = this.getCollectionPath(collection);
        
        if (!fs.existsSync(filePath)) {
            return [];
        }

        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            if (!data.trim()) {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error(`Erro ao ler coleção ${collection}:`, error);
            return [];
        }
    }

    private writeCollection(collection: string, data: any[]) {
        const filePath = this.getCollectionPath(collection);
        try {
            this.ensureDataDirectory();
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Erro ao escrever coleção ${collection}:`, error);
            throw error;
        }
    }

    async create<T>(collection: string, data: T): Promise<T> {
        try {
            const items = this.readCollection(collection);
            items.push(data);
            this.writeCollection(collection, items);
            return data;
        } catch (error) {
            console.error(`Erro ao criar item na coleção ${collection}:`, error);
            throw error;
        }
    }

    async find<T>(collection: string, filter?: (item: T) => boolean): Promise<T[]> {
        const items = this.readCollection(collection);
        if (filter) {
            return items.filter(filter);
        }
        return items;
    }

    async findOne<T>(collection: string, filter: (item: T) => boolean): Promise<T | null> {
        const items = this.readCollection(collection);
        return items.find(filter) || null;
    }

    async update<T>(collection: string, id: string, data: Partial<T>): Promise<T | null> {
        const items = this.readCollection(collection);
        const index = items.findIndex(item => item.id === id);

        if (index === -1) return null;

        items[index] = { ...items[index], ...data };
        this.writeCollection(collection, items);
        return items[index];
    }

    async delete(collection: string, id: string): Promise<boolean> {
        const items = this.readCollection(collection);
        const filteredItems = items.filter(item => item.id !== id);

        if (filteredItems.length === items.length) return false;

        this.writeCollection(collection, filteredItems);
        return true;
    }
}
