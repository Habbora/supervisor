/**
 * System Runtime API
 *
 * Injetado automaticamente em todos os drivers
 * Provê APIs seguras para comunicação, logging, events, etc.
 */

export interface SystemRuntime {
  /**
   * Network - Comunicação TCP/UDP
   */
  network: {
    /**
     * Cria um socket TCP
     * Config vem do controller.config injetado
     */
    createTcpSocket(config: {
      host: string;
      port: number;
      timeout?: number;
    }): TcpSocket;

    /**
     * Cria um socket UDP
     */
    createUdpSocket(config: {
      host: string;
      port: number;
    }): UdpSocket;
  };

  /**
   * Modbus - Utilitários para protocolo Modbus
   */
  modbus: {
    /**
     * Constrói comando para escrever coil (switch)
     */
    writeCoil(address: number, value: boolean): Buffer;

    /**
     * Constrói comando para ler coil
     */
    readCoil(address: number): Buffer;

    /**
     * Constrói comando para ler múltiplos coils
     */
    readCoils(startAddress: number, count: number): Buffer;

    /**
     * Parse resposta de leitura de coil único
     */
    parseCoil(buffer: Buffer): boolean;

    /**
     * Parse resposta de leitura de múltiplos coils
     */
    parseCoils(buffer: Buffer, count: number): boolean[];
  };

  /**
   * Events - Sistema de eventos para comunicação
   */
  events: {
    /**
     * Emite evento (ex: atualização de estado)
     */
    emit(event: string, data: any): void;

    /**
     * Escuta evento
     */
    on(event: string, callback: (data: any) => void): void;
  };

  /**
   * Logger - Sistema de logging
   */
  logger: {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
  };

  /**
   * Scheduler - Agendamento de tarefas
   */
  scheduler: {
    setTimeout(callback: () => void, ms: number): void;
    setInterval(callback: () => void, ms: number): void;
    clearTimeout(id: any): void;
    clearInterval(id: any): void;
  };
}

/**
 * TCP Socket Interface
 */
export interface TcpSocket {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(buffer: Buffer): Promise<void>;
  sendAndWait(buffer: Buffer, timeout?: number): Promise<Buffer>;
  on(event: 'data' | 'error' | 'close', callback: (data?: any) => void): void;
  isConnected(): boolean;
}

/**
 * UDP Socket Interface
 */
export interface UdpSocket {
  bind(): Promise<void>;
  send(buffer: Buffer, host: string, port: number): Promise<void>;
  on(event: 'message' | 'error', callback: (data?: any) => void): void;
  close(): void;
}

/**
 * Config injetado do controller
 */
export interface DriverConfig {
  host: string;
  port: number;
  [key: string]: any; // Configs adicionais específicas do driver
}

/**
 * Global system disponível em todos os drivers
 */
declare global {
  const system: SystemRuntime;
  const config: DriverConfig;
}
