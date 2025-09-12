import path from "path";
import fs from "fs";

/* Função para carregar o arquivo de database
**
*/

export class Database {
    private static instance: Database;
    private database: any;

    private constructor() {
        this.loadDatabase();
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private async loadDatabase(): Promise<boolean> {
        // TODO: Verificar se o diretório de database existe
        const databaseDir = path.join(process.cwd(), "database");
        if (!fs.existsSync(databaseDir)) {
            fs.mkdirSync(databaseDir);
        }

        // TODO: Verificar se o arquivo de database existe
        const databasePath = path.join(process.cwd(), "database", "database.json");

        if (!fs.existsSync(databasePath)) {
            fs.writeFileSync(databasePath, JSON.stringify({}));
        }
        this.database = JSON.parse(fs.readFileSync(databasePath, "utf8"));
        return true;
    }

    // TODO: Função para salvar o arquivo de database
    private saveDatabase(data: any): boolean {
        const databasePath = path.join(process.cwd(), "database", "database.json");
        fs.writeFileSync(databasePath, JSON.stringify(data));
        return true;
    }

    public readDatabase(): any {
        return this.database;
    }

    public writeDatabase(data: any): boolean {
        this.database = data;
        return this.saveDatabase(data);
    }
}
