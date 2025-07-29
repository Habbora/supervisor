








export class ModbusClient {
    private client?: Bun.Socket;

    constructor(ip: string, port: number) {
        this.connect(ip, port);
    }

    async connect(host: string, port: number) {
        this.client = await Bun.connect({
            hostname: host,
            port: port,
            socket: {
                data(socket, data) { },
                open(socket) { },
                close(socket, error) { },
                drain(socket) { },
                error(socket, error) { },

                // client-specific handlers
                connectError(socket, error) { }, // connection failed
                end(socket) { }, // connection closed by server
                timeout(socket) { }, // connection timed out
            }
        });
    }
}