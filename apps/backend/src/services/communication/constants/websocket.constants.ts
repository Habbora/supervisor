export const WEBSOCKET_CONFIG = {
  HOST: '0.0.0.0',
  PORT: 4001,
} as const;

export const WEBSOCKET_ERRORS = {
  INVALID_MESSAGE: "Mensagem inválida",
  INTERNAL_ERROR: "Erro interno no servidor",
  UNSUPPORTED_TYPE: (type: string) => `Tipo de mensagem não suportado: ${type}`,
  HANDLER_ERROR: "Erro interno no processamento da mensagem",
} as const;

export const WEBSOCKET_ROUTES = {
  ROOT: "/",
} as const;