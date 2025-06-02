import { SupervisorService } from "./src/services/core/SupervisorService";
import { Command } from "commander/typings/esm.d.mts";
import readline from "readline";
import { Device } from "./src/services/devices/Device";

const program = new Command();

program
  .name("home-cli")
  .description("CLI para controle de dispositivos da casa")
  .version("1.0.0");

program
  .command("list")
  .description("Lista todos os dispositivos")
  .action(async () => {
    const supervisor = new SupervisorService();
    await supervisor.initialize();
    const devices = supervisor.deviceService.getAllDevices();
    console.log("Dispositivos encontrados:");
    devices.forEach((device: Device) => {
      console.log(`- ${device.name} (${device.driverName})`);
    });
    await supervisor.destroy();
  });

program
  .command("control")
  .description("Controla um dispositivo específico")
  .argument("<deviceName>", "Nome do dispositivo")
  .argument("<address>", "Endereço do dispositivo")
  .argument("<value>", "Valor a ser definido (0 ou 1)")
  .action(async (deviceName, address, value) => {
    const supervisor = new SupervisorService();
    await supervisor.initialize();
    try {
      const device = supervisor.deviceService.getDevice(deviceName);
      device.setOutput(parseInt(address), parseInt(value));
      console.log(`Dispositivo ${deviceName} configurado com sucesso!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Erro ao controlar dispositivo: ${error.message}`);
      } else {
        console.error("Erro desconhecido ao controlar dispositivo");
      }
    }
    await supervisor.destroy();
  });

program
  .command("interactive")
  .description("Modo interativo para controlar dispositivos")
  .action(async () => {
    const supervisor = new SupervisorService();
    await supervisor.initialize();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("Modo interativo iniciado. Digite 'exit' para sair.");

    const askCommand = () => {
      rl.question("Digite o comando (list/control <device> <address> <value>/exit): ", async (input) => {
        if (input.toLowerCase() === "exit") {
          await supervisor.destroy();
          rl.close();
          return;
        }

        const [command, ...args] = input.split(" ");

        switch (command.toLowerCase()) {
          case "list":
            const devices = supervisor.deviceService.getAllDevices();
            console.log("Dispositivos encontrados:");
            devices.forEach((device: Device) => {
              console.log(`- ${device.name} (${device.driverName})`);
            });
            break;
          case "control":
            if (args.length !== 3) {
              console.log("Uso: control <device> <address> <value>");
              break;
            }
            try {
              const device = supervisor.deviceService.getDevice(args[0]);
              device.setOutput(parseInt(args[1]), parseInt(args[2]));
              console.log(`Dispositivo ${args[0]} configurado com sucesso!`);
            } catch (error: unknown) {
              if (error instanceof Error) {
                console.error(`Erro ao controlar dispositivo: ${error.message}`);
              } else {
                console.error("Erro desconhecido ao controlar dispositivo");
              }
            }
            break;
          default:
            console.log("Comando não reconhecido. Comandos disponíveis: list, control, exit");
        }
        askCommand();
      });
    };

    askCommand();
  });

program.parse(); 