import { ModbusTCPClient } from "@/lib/modbus/modbus_tcp_client"
import type { Driver } from "./driver.interface"
import EventEmitter from "events"
import { z } from "zod"

type ModbusTCPClientDriverProps = {
    host?: string,
    port?: number,
    pollingTime?: number,
    tags?: ModbusTag[]
}

type ModbusTag = {
    name: string,
    address: number,
    slaveId: number,
}

const ModbusTCPClientConfigSchema = z.object({
    configs: z.object({
        host: z.ipv4().describe(JSON.stringify({
            mode: "input",
            label: "IP do controlador",
            placeholder: "192.168.1.100",
            description: "Endereço IP do controlador na rede",
        })),
        port: z.number().min(1).max(65535).default(502).describe(JSON.stringify({
            mode: "input",
            label: "Porta Modbus TCP",
            placeholder: "502",
            description: "Porta Modbus TCP (padrão: 502)",
        })),
        pollingTime: z.number().min(1).max(60000).default(1000).describe(JSON.stringify({
            mode: "input",
            label: "Polling Time (ms)",
            placeholder: "1000",
            description: "Intervalo entre leituras (padrão: 1000ms)",
        })),
        timeout: z.number().min(1).max(60000).default(5000).describe(JSON.stringify({
            mode: "input",
            label: "Timeout (ms)",
            placeholder: "5000",
            description: "Tempo máximo de espera por resposta",
        })),
    }),
    tags: z.array(z.object({
        name: z.string().min(1).describe(JSON.stringify({
            mode: "input",
            label: "Nome",
            placeholder: "Nome",
            description: "Nome da tag",
        })),
        address: z.number().min(0).max(65535).describe(JSON.stringify({
            mode: "input",
            label: "Endereço",
            placeholder: "0",
            description: "Endereço da tag",
        })),
        slaveId: z.number().min(0).max(255).describe(JSON.stringify({
            mode: "input",
            label: "Slave ID",
            placeholder: "0",
            description: "Slave ID da tag",
        })),
        type: z.string().min(1).describe(JSON.stringify({
            mode: "input",
            label: "Tipo",
            placeholder: "Tipo",
            description: "Tipo da tag",
        })),
    }))
})

export class ModbusTCPClientDriver extends EventEmitter implements Driver<ModbusTag> {
    readonly name = "Modbus TCP Client"
    readonly description = "Modbus TCP Client"
    readonly version = 1

    client: ModbusTCPClient | null = null
    isConnected: boolean = false

    tags: Map<number, ModbusTag> = new Map()
    values: Map<number, number> = new Map()

    private pollingInterval?: NodeJS.Timeout
    private pollingTime: number
    private startAddress: number = 0
    private endAddress: number = 100

    constructor(props: ModbusTCPClientDriverProps) {
        super()

        this.pollingTime = props.pollingTime || 1000

        if (!props.host || !props.port) return

        this.client = new ModbusTCPClient({
            host: props.host,
            port: props.port,
        })

        this.client.on("open", () => {
            this.emit('connected')
            this.isConnected = true
            this.startPolling()
        })

        this.client.on("close", () => {
            this.emit('disconnected')
            this.isConnected = false
            this.stopPolling()
        })

        if (props.tags) {
            props.tags.forEach(tag => {
                this.tags.set(tag.address, tag)
            })
        }
    }

    private optimizeReadRequests() {
        const coils: number[] = []
        const discreteInputs: number[] = []
        const holdingRegisters: number[] = []
        const inputRegisters: number[] = []

        // Mapeia as tags por tipo
        this.tags.forEach(tag => {
            if (tag.address > 40000) {
                holdingRegisters.push(tag.address)
            } else if (tag.address > 30000) {
                inputRegisters.push(tag.address)
            } else if (tag.address > 10000) {
                discreteInputs.push(tag.address)
            } else if (tag.address > 0) {
                coils.push(tag.address)
            }
        })

        const coilsSorted = coils.sort((a, b) => a - b)
        const discreteInputsSorted = discreteInputs.sort((a, b) => a - b)
        const holdingRegistersSorted = holdingRegisters.sort((a, b) => a - b)
        const inputRegistersSorted = inputRegisters.sort((a, b) => a - b)

        const coilsReadRequests: { startAddress: number, quantity: number }[] = []
        const discreteInputsReadRequests: { startAddress: number, quantity: number }[] = []
        const holdingRegistersReadRequests: { startAddress: number, quantity: number }[] = []
        const inputRegistersReadRequests: { startAddress: number, quantity: number }[] = []

        let startAddress = 0
        let quantity = 0
        let count = false

        coilsSorted.forEach((address, index) => {
            if (address === 0) {
                startAddress = address
                quantity = 1
                count = true
            } else {
                if (count) {
                    if (address === startAddress + 1) {
                        quantity++
                    } else {
                        coilsReadRequests.push({ startAddress, quantity })
                        count = false
                    }
                }
                startAddress = address
                quantity = 1
            }
        })

        discreteInputsSorted.forEach((address, index) => {
            if (address === 0) {
                startAddress = address
                quantity = 1
                count = true
            } else {
                if (count) {
                    if (address === startAddress + 1) {
                        quantity++
                    } else {
                        discreteInputsReadRequests.push({ startAddress, quantity })
                        count = false
                    }
                }
                startAddress = address
                quantity = 1
            }
        })

        holdingRegistersSorted.forEach((address, index) => {
            if (address === 0) {
                startAddress = address
                quantity = 1
                count = true
            } else {
                if (count) {
                    if (address === startAddress + 1) {
                        quantity++
                    } else {
                        holdingRegistersReadRequests.push({ startAddress, quantity })
                        count = false
                    }
                }
                startAddress = address
                quantity = 1
            }
        })

        inputRegistersSorted.forEach((address, index) => {
            if (address === 0) {
                startAddress = address
                quantity = 1
                count = true
            } else {
                if (count) {
                    if (address === startAddress + 1) {
                        quantity++
                    } else {
                        inputRegistersReadRequests.push({ startAddress, quantity })
                        count = false
                    }
                }
                startAddress = address
                quantity = 1
            }
        })

        return {
            coilsReadRequests,
            discreteInputsReadRequests,
            holdingRegistersReadRequests,
            inputRegistersReadRequests,
        }
    }

    private startPolling() {
        if (!this.client) return
        if (this.pollingInterval)
            this.stopPolling()

        const {
            coilsReadRequests,
            discreteInputsReadRequests,
            holdingRegistersReadRequests,
            inputRegistersReadRequests
        } = this.optimizeReadRequests()

        this.pollingInterval = setInterval(() => {
            holdingRegistersReadRequests.forEach(request => {
                this.client?.readHoldingRegisters(request.startAddress, request.quantity)
                    .then(data => {
                        data.forEach((value, index) => {
                            const tag = this.tags.get(value.)
                            if (!tag) return
                            if (tag.value === value) return
                            tag.value = value
                            this.tags.set(0x4000 + index, tag)
                            this.emit("tagUpdated", tag)
                        })
                    })
                    .catch(error => {
                    })
            })
        }, this.pollingTime)
    }

    private stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = undefined;
        }
    }

    start = async () => {
        this.client?.connect()
    }

    stop = async () => {
        this.client?.close()
    }

    setOn = async (tag: ModbusTag) => {
        this.client?.writeMultipleRegister(tag.address, [1], tag.slaveId)
    }

    setOff = async (tag: ModbusTag) => {
        this.client?.writeMultipleRegister(tag.address, [0], tag.slaveId)
    }

    setValue = async (tag: ModbusTag, value: number) => {
        this.client?.writeMultipleRegister(tag.address, [value], tag.slaveId)
    }

    getValue = async (tag: ModbusTag) => {
        this.client?.readHoldingRegisters(tag.address, tag.slaveId)
    }

    addTag = (tag: Omit<ModbusTag, "id">) => {
        let prefix = 0
        switch (tag.type) {
            case "coils":
                prefix = 0x0000
                break
            case "discreteInputs":
                prefix = 0x1000
                break
            case "inputRegisters":
                prefix = 0x3000
                break
            case "holdingRegisters":
                prefix = 0x4000
                break
        }

        this.tags.set(prefix + tag.address, {
            id: prefix + tag.address,
            ...tag,
        })
    }

    removeTag = (tag: ModbusTag) => {
        this.tags.delete(tag.address)
    }

    get configSchemaJSON() {
        return z.toJSONSchema(ModbusTCPClientConfigSchema)
    }
}
