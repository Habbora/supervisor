import EventEmitter from "events"

type ModbusTCPClientProps = {
    host: string,
    port: number,
}

export class ModbusTCPClient extends EventEmitter {
    // Connection
    private _host: string
    private _port: number
    private _reconnectInterval: number
    private _connection?: Bun.Socket<Buffer>
    private _rxBuffer: Buffer = Buffer.alloc(0)
    private _pendingRequests: Map<number, { resolve: (value: any) => void, reject: () => void }> = new Map()
    private _transactionId: number = 0
    private _timeout: number = 1000

    private MAX_BUFFER_SIZE: number = 260
    private readonly MODBUS_FUNCTION_CODES = {
        READ_COILS: 0x01,
        READ_DISCRETE_INPUTS: 0x02,
        READ_HOLDING_REGISTERS: 0x03,
        READ_INPUT_REGISTERS: 0x04,
        WRITE_SINGLE_COIL: 0x05,
        WRITE_SINGLE_REGISTER: 0x06,
        WRITE_MULTIPLE_COILS: 0x0F,
        WRITE_MULTIPLE_REGISTERS: 0x10,
    }

    constructor(props: ModbusTCPClientProps) {
        super()

        this._host = props.host
        this._port = props.port

        this._reconnectInterval = 5000
    }

    public connect = async () => {
        Bun.connect<Buffer>({
            hostname: this._host,
            port: this._port,
            socket: {
                open: this.onopen.bind(this),
                data: this.ondata.bind(this),
                close: this.onclose.bind(this),
            }
        }).catch(e => {
            this.reconnect()
        })
    }

    private reconnect = async () => {
        setTimeout(() => this.connect(), this._reconnectInterval)
        this.emit("close")
    }

    public close = async () => {
        this._connection?.end()
        this._connection = undefined
        // Rejeita todas as requisições pendentes
        for (const [, pending] of this._pendingRequests) {
            pending.reject()
        }
        this._pendingRequests.clear()
        // Limpa buffers
        this._rxBuffer = Buffer.alloc(0)
    }

    private onopen = (socket: Bun.Socket<any>) => {
        this._connection = socket
        this.emit("open")
    }

    private ondata = (socket: Bun.Socket<any>, data: Buffer) => {
        try {
            this._rxBuffer = Buffer.concat([this._rxBuffer, data])

            if (this._rxBuffer.length > this.MAX_BUFFER_SIZE) {
                this._rxBuffer = Buffer.alloc(0)
                return
            }

            while (true) {
                // Precisa de pelo menos 6 bytes para ler o header MBAP
                if (this._rxBuffer.length < 6) break
                const length = this._rxBuffer.readUInt16BE(4) + 6
                //
                if (length < 8 || length > 260) {
                    this._rxBuffer = Buffer.alloc(0)
                    break
                }
                // Verifica se temos o frame completo
                if (this._rxBuffer.length < length) break
                // Extrai APENAS o frame atual (não o buffer inteiro)
                const frame = this._rxBuffer.subarray(0, length)
                // Remove frame processado do buffer (pode sobrar outros frames)
                this._rxBuffer = this._rxBuffer.subarray(length)
                // Processa o frame
                const response = this.parseModbusResponse(frame)
                const pending = this._pendingRequests.get(response.txId)

                if (pending) {
                    this._pendingRequests.delete(response.txId)
                    if (response.sucess) {
                        pending.resolve(response.data)
                    } else {
                        pending.reject()
                    }
                }
            }

        } catch (error) {
            this._rxBuffer = Buffer.alloc(0)
        }
    }

    private onclose = (socket: Bun.Socket<any>) => {
        this.emit("close")
        this._connection?.end()
        this._connection = undefined
        // Rejeita todas as requisições pendentes
        for (const [, pending] of this._pendingRequests) {
            pending.reject()
        }
        this._pendingRequests.clear()
        // Limpa buffers
        this._rxBuffer = Buffer.alloc(0)
        this.reconnect()
    }

    // Recebendo Mensagem Modbus...
    private parseModbusResponse = (buffer: Buffer) => {
        const txId = buffer.readUInt16BE(0);
        const protocolId = buffer.readUInt16BE(2);
        const length = buffer.readUInt16BE(4);
        const unitId = buffer.readUInt8(6);
        const functionCode = buffer.readUInt8(7);
        // Check Error...
        if (functionCode & 0x80) {
            const data = buffer.readUInt8(8);
            return { sucess: false, txId, protocolId, length, unitId, functionCode, data }
        }
        const data = buffer.subarray(8);
        return { sucess: true, txId, protocolId, length, unitId, functionCode, data };
    }

    // Enviando Mensagem Modbus...
    private sendModbusRequest(buffer: Buffer): boolean {
        if (!this._connection) return false
        const size = this._connection.write(buffer)
        return size > 0 ? true : false
    }

    private getNextTransactionId = () => {
        this._transactionId = (this._transactionId + 1) % 0xFFFF
        return this._transactionId
    }

    private createModbusFrame = (pdu: Buffer, unitId: number) => {
        const txId = this.getNextTransactionId();
        const protocolId = 0x0000;
        const length = pdu.length + 1;
        const buffer = Buffer.alloc(7 + pdu.length)
        buffer.writeUInt16BE(txId, 0)
        buffer.writeUInt16BE(protocolId, 2)
        buffer.writeUInt16BE(length, 4)
        buffer.writeUInt8(unitId, 6)
        pdu.copy(buffer, 7)
        return { buffer, txId };
    };

    private booleansToBuffer(array: boolean[]): Buffer {
        const byteCount = Math.ceil(array.length / 8)
        const buffer = Buffer.alloc(byteCount)
        for (let count = 0; count < byteCount; count++) {
            let byte = 0
            for (let bits = 0; bits < 8; bits++) {
                byte |= (array[count * 8 + bits] ? 1 : 0) << bits
            }
            buffer.writeUInt8(byte, count)
        }
        return buffer
    }

    private numbersToBuffer(array: number[], encoding: 'uint8' | 'uint16be' | 'uint16le' | 'uint32be' | 'uint32le'): Buffer {
        const byteCount = array.length * 2
        const buffer = Buffer.alloc(byteCount)
        for (let count = 0; count < array.length; count++) {
            buffer.writeUint16BE(array[count], count * 2)
        }
        return buffer
    }

    public readHoldingRegisters = async (
        address: number,
        quantity: number = 1,
        unitId: number = 1
    ): Promise<number[]> => {
        // Validação
        if (quantity < 1 || quantity > 125) {
            throw new Error('Quantity must be between 1 and 125')
        }

        // Construir PDU
        const pduBuffer = Buffer.alloc(5)
        pduBuffer.writeUInt8(this.MODBUS_FUNCTION_CODES.READ_HOLDING_REGISTERS, 0)
        pduBuffer.writeUInt16BE(address, 1)
        pduBuffer.writeUInt16BE(quantity, 3)

        // Construindo o Frame
        const { buffer, txId } = this.createModbusFrame(pduBuffer, unitId)

        const result = await new Promise<Buffer>((resolve, reject) => {
            // 1. Configurar timeout
            const timeout = setTimeout(() => {
                this._pendingRequests.delete(txId)
                reject(new Error(`Modbus request timeout (txId: ${txId})`))
            }, this._timeout)

            // 2. Registrar callbacks
            this._pendingRequests.set(txId, {
                resolve: (response: Buffer) => {
                    clearTimeout(timeout)
                    this._pendingRequests.delete(txId)
                    resolve(response)
                },
                reject: () => {
                    clearTimeout(timeout)
                    this._pendingRequests.delete(txId)
                    reject()
                }
            })

            // 3. Enviar request
            if (!this.sendModbusRequest(buffer)) {
                clearTimeout(timeout)
                this._pendingRequests.delete(txId)
                reject(new Error('Failed to send Modbus request'))
            }
        });

        const registers = []
        for (let i = 1; i < result.length; i += 2) {
            registers.push(result.readUInt16BE(i))
        }

        return registers
    }

    public writeMultipleRegister = async (address: number, data: number[], unitId: number = 1): Promise<boolean> => {
        const dataBuffer = this.numbersToBuffer(data, 'uint16be')
        // Calculo do pdu length
        const pduBuffer = Buffer.alloc(6 + dataBuffer.length)
        pduBuffer.writeUint8(this.MODBUS_FUNCTION_CODES.WRITE_MULTIPLE_REGISTERS, 0)
        pduBuffer.writeUInt16BE(address, 1)
        pduBuffer.writeUInt16BE(data.length, 3)
        pduBuffer.writeUInt8(dataBuffer.length, 5)
        dataBuffer.copy(pduBuffer, 6)

        const { buffer, txId } = this.createModbusFrame(pduBuffer, 1)

        const result = await new Promise<Buffer>((resolve, reject) => {
            // 1. Configurar timeout
            const timeout = setTimeout(() => {
                this._pendingRequests.delete(txId)
                reject(new Error(`Modbus request timeout (txId: ${txId})`))
            }, this._timeout)

            // 2. Registrar callbacks
            this._pendingRequests.set(txId, {
                resolve: (response: Buffer) => {
                    clearTimeout(timeout)
                    this._pendingRequests.delete(txId)
                    resolve(response)
                },
                reject: () => {
                    clearTimeout(timeout)
                    this._pendingRequests.delete(txId)
                    reject()
                }
            })

            // 3. Enviar request
            if (!this.sendModbusRequest(buffer)) {
                clearTimeout(timeout)
                this._pendingRequests.delete(txId)
                reject(new Error('Failed to send Modbus request'))
            }
        }).catch(error => { })

        return result ? true : false
    }
}