import path from "path";
import fs from "fs";

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

    // TODO: Init para verificar/criar o arquivo de database
    private async loadDatabase(): Promise<boolean> {
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

    // TODO: Função para ler os dados do arquivo de database
    public readDatabase(): any {
        return this.database;
    }

    // TODO: Função para escrever os dados no arquivo de database
    public writeDatabase(data: any): boolean {
        this.database = data;
        return this.saveDatabase(data);
    }
}