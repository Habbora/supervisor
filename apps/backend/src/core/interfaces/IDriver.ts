export interface IDriver {
    readonly name: string;
    readonly version: string;
    readonly type: string;

    async init(): Promise<void>;
    async destroy(): Promise<void>;
    async read(address: string): Promise<number>;
    async write(address: string, value: number): Promise<void>;
    async readAll(): Promise<number[]>;
    async writeAll(values: number[]): Promise<void>;
    async readAllByAddress(address: string): Promise<number[]>;
    async writeAllByAddress(address: string, values: number[]): Promise<void>;
}