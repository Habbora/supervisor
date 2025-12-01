import type { Driver } from "./drivers/driver.interface";

export type CreateControllerInstanceProps = {
    id: string
    name: string
    driver: string
    config?: any
    tags?: any
}

export class ControllerInstance {
    private readonly _id: string;
    private _name: string;
    private _driverName: string;

    private _driver: Driver<any> | undefined
    private _config: any
    private _tags: any[]

    private _isConnected: boolean = false

    constructor(
        dto: CreateControllerInstanceProps,
        driverFactory: (config: any) => Driver<any>,
    ) {
        this._id = dto.id
        this._name = dto.name
        this._driverName = dto.driver
        this._config = dto.config ?? {}
        this._tags = dto.tags ?? []
        this._driver = driverFactory(this._config)

        this._driver?.start()

        this._driver?.on("connected", () => {
            this._isConnected = true
        })
        this._driver?.on("disconnected", () => {
            this._isConnected = false
        })
    }

    async close() {
        await this._driver?.stop();
    }

    get configSchemaJSON() {
        return this._driver?.configSchemaJSON
    }

    toJSON() {
        return {
            id: this._id,
            name: this._name,
            driver: this._driverName,
            configs: this._config,
            tags: this._tags,
            status: this.status,
        }
    }

    get id() {
        return this._id
    }

    get name() {
        return this._name
    }

    get config() {
        return this._config
    }

    get status() {
        return {
            isConnected: this._isConnected,
        }
    }
}
