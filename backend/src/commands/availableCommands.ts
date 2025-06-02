import { SupervisorService } from "../services/core/SupervisorService";

export interface Command {
  name: string;
  description: string;
  usage?: string;
}

export const deviceCommands: Command[] = [
  {
    name: "list",
    description: "Lista todos os dispositivos cadastrados no sistema",
  },
  {
    name: "add",
    description: "Adiciona um novo dispositivo ao sistema",
    usage: "<nome> <driver> [--force-id <id>] [--config.<chave>=<valor> ...]",
  },
  {
    name: "setOutput",
    description: "Define o estado de uma saída digital do dispositivo",
    usage: "<deviceId> <endpointId> <valor>",
  },
  {
    name: "pulseOutput",
    description: "Gera um pulso em uma saída digital do dispositivo",
    usage: "<deviceId> <endpointId>",
  },
];

export const lightCommands: Command[] = [
  {
    name: "list",
    description: "Lista todas as luzes cadastradas no sistema",
  },
  {
    name: "add",
    description: "Adiciona uma nova luz ao sistema",
    usage: "<nome> <deviceId> <endpointId> [--force-id <id>]",
  },
  {
    name: "setOn",
    description: "Liga uma luz específica",
    usage: "<lightId>",
  },
  {
    name: "setOff",
    description: "Desliga uma luz específica",
    usage: "<lightId>",
  },
  {
    name: "setToggle",
    description: "Alterna o estado de uma luz (liga/desliga)",
    usage: "<lightId>",
  },
];

export const mainCommands: Command[] = [
  {
    name: "device",
    description: "Comandos para gerenciar dispositivos (ex: MPC46A, sensores, etc)",
  },
  {
    name: "light",
    description: "Comandos para gerenciar luzes e iluminação",
  },
  {
    name: "help",
    description: "Mostra esta lista de comandos disponíveis",
  },
  {
    name: "exit",
    description: "Encerra o programa e desconecta todos os dispositivos",
  },
]; 