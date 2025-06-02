/**
 * Tipos e interfaces para o módulo Modbus
 */

/**
 * Tipos de mensagens que podem ser enviadas/recebidas
 */
export enum ModbusMessageType {
  WRITE = "write",     // Operação de escrita
  READ = "read",       // Operação de leitura
  STATUS = "status",   // Status da conexão
  ERROR = "error",     // Erro ocorrido
  UPDATE = "update",   // Atualização de valores
  SOCKET = "socket",   // Eventos de socket
  FINISH = "finish",   // Finalização
}

/**
 * Configuração do módulo Modbus
 */
export interface ModbusConfig {
  host: string;        // Endereço IP do servidor Modbus
  port?: number;       // Porta do servidor (padrão: 502)
  postMessage: (message: ModbusMessageResponse) => void;  // Callback para mensagens
}

/**
 * Mensagem de requisição para o Modbus
 */
export interface ModbusMessageRequest {
  id?: string;
  type: "write";       // Tipo da operação
  payload?: ModbusPayloadRequest;
  timestamp?: number;
  requestId?: string;
}

/**
 * Payload da requisição Modbus
 */
export interface ModbusPayloadRequest {
  address?: number;    // Endereço do registro
  value?: number | boolean;  // Valor a ser escrito
  type?: "DISCRETE" | "NUMBER" | "COIL";  // Tipo do dado
  status?: string;
  error?: Error;
  network?: {
    host: string;
    port: number;
  };
}

/**
 * Resposta do Modbus
 */
export type ModbusMessageResponse = {
  id?: string;
  type: ModbusMessageType;
  payload?: ModbusPayloadResponse[];
  timestamp?: number;
  requestId?: string;
  error?: Error;
};

/**
 * Payload da resposta Modbus
 */
export type ModbusPayloadResponse = {
  address?: number;    // Endereço do registro
  value?: number | boolean;  // Valor lido/escrito
  type?: "DISCRETE" | "NUMBER" | "COIL";  // Tipo do dado
  status?: string;     // Status da operação
  error?: Error;       // Erro ocorrido
}; 