import fs from "fs";
import path from "path";

interface DeviceConfig {
  name: string;
  interface: string;
  endpoints_register: {
    name: string;
    address: number;
    endpointType: string;
  }[];
  endpoints_number: {
    name: string;
    address: number;
    endpointType: string;
    min: number;
    max: number;
    step: number;
  }[];
}

export function readDevicesConfig(): DeviceConfig[] {
  // Caminho para a pasta de configuração dos dispositivos
  const configPath = path.join(__dirname, "../controllerConfigs");

  // Lê todos os arquivos da pasta
  const files = fs.readdirSync(configPath);

  // Filtra apenas os arquivos JSON
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  // Lê cada arquivo JSON e retorna um array com os dados
  const devicesConfig = jsonFiles
    .map((file) => {
      const filePath = path.join(configPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      try {
        return JSON.parse(fileContent);
      } catch (error) {
        console.error(`Erro ao ler o arquivo ${file}:`, error);
        return null;
      }
    })
    .filter((config) => config !== null) as DeviceConfig[];

  return devicesConfig;
}
