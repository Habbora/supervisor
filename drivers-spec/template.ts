/**
 * @file template.ts
 * @description
 *   Este é um template para um driver funcional e simples, sem o uso de classes.
 *   O driver é um objeto com metadados, esquema de configuração e um método 'create'
 *   que retorna uma instância funcional do driver.
 *   O sistema host injetará uma API 'system' ao criar a instância,
 *   fornecendo acesso limitado e seguro a recursos.
 */

// --- Definição da API do Sistema (Documentação) ---
// O objeto 'system' injetado na função 'create' deve ter a seguinte estrutura:
interface SystemAPI {
  network: {
    createTcpSocket(options: { host: string; port: number; timeout?: number }): any;
  };
  bidding: {
    createMaster(biddingName: string): BiddingMaster;
  };
}

interface BiddingMaster {
  on(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

// --- Implementação do Driver ---

/**
 * Metadados que descrevem o driver.
 * O sistema pode ler isso sem instanciar o driver.
 */
export const metadata = {
  name: 'Modbus TCP Client',
  version: '1.0.0',
  description: 'Driver para comunicação Modbus TCP/IP.',
};

/**
 * Esquema de configuração.
 * O sistema usa isso para gerar uma interface de configuração para o usuário
 * e validar o objeto 'config' que será passado para a função 'create'.
 */
export const configSchema = {
  host: {
    name: 'Host',
    type: 'string',
    required: true,
    default: '127.0.0.1',
  },
  port: {
    name: 'Port',
    type: 'number',
    required: true,
    default: 502,
  },
  timeout: {
      name: 'Timeout (ms)',
      type: 'number',
      default: 5000,
  }
};

/**
 * Função factory que cria e retorna uma instância do driver.
 * @param system A API injetada pelo host.
 * @param config A configuração do usuário, validada com base no 'configSchema'.
 * @returns Um objeto com os métodos de ciclo de vida 'onInit' e 'onClose'.
 */
export function create(system: SystemAPI, config: any) {
  // Variáveis de estado do driver (equivalente a 'this' na classe)
  let socket: any;
  const bidding = system.bidding.createMaster('modbus-tcp-events');

  // --- Métodos Internos ---

  const handleData = (data: Buffer) => {
    console.log(`[${metadata.name}] Dados recebidos:`, data);
    // Lógica para processar os dados Modbus recebidos...
    bidding.emit('data-processed', { value: data.readInt16BE(0) });
  };

  const handleSocketError = (error: Error) => {
    console.error(`[${metadata.name}] Erro no socket:`, error);
    bidding.emit('driver-error', { message: error.message });
  };

  const handleSocketClose = () => {
    console.log(`[${metadata.name}] Conexão fechada.`);
    bidding.emit('connection-status', { status: 'disconnected' });
  };

  // --- Métodos de Ciclo de Vida ---

  /**
   * Método de inicialização.
   * Chamado pelo sistema host depois que o driver é criado.
   */
  const onInit = () => {
    console.log(`[${metadata.name}] Inicializando...`);

    socket = system.network.createTcpSocket({
      host: config.host,
      port: config.port,
      timeout: config.timeout,
    });

    socket.on('data', handleData);
    socket.on('error', handleSocketError);
    socket.on('close', handleSocketClose);

    socket.connect();

    bidding.on('read-register', (register: number) => {
        console.log(`[${metadata.name}] Recebido pedido para ler registrador: ${register}`);
        // Lógica para enviar comando Modbus via socket...
    });

    console.log(`[${metadata.name}] Conectando a ${config.host}:${config.port}`);
  };

  /**
   * Método de finalização.
   * Chamado pelo sistema host para desligar o driver de forma segura.
   */
  const onClose = () => {
    console.log(`[${metadata.name}] Finalizando...`);
    if (socket) {
      socket.close();
    }
  };

  // Retorna os métodos que o sistema host pode chamar
  return {
    onInit,
    onClose,
  };
}
