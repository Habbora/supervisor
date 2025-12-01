import EventEmitter from "events"

export type Driver<T> = EventEmitter & {
    name: string
    description: string
    version: number

    configSchemaJSON: any

    start(): Promise<void>
    stop(): Promise<void>

    setOn(tag: T): Promise<void>
    setOff(tag: T): Promise<void>
    setValue(tag: T, value: boolean | number): Promise<void>
}
