import { Worker } from "worker_threads";
import path from "path";

console.log("🧪 Testando worker...");

const workerPath = path.join(process.cwd(), "workers", "modbus", "worker.ts");
console.log("📁 Caminho do worker:", workerPath);

const worker = new Worker(workerPath);

worker.on("message", (message) => {
  console.log("📨 Mensagem recebida do worker:", message);
});

worker.on("error", (error) => {
  console.error("❌ Erro no worker:", error);
});

worker.on("exit", (code) => {
  console.log("🚪 Worker saiu com código:", code);
});

// Enviar mensagem de inicialização
worker.postMessage({
  type: "init",
  payload: {
    driver: "mcp46a",
    network: {
      host: "192.168.100.240",
      port: 502,
    },
    endpoints: {
      inputs: [],
      outputs: []
    }
  }
});

// Aguardar um pouco e depois fechar
setTimeout(() => {
  console.log("⏰ Fechando teste...");
  worker.terminate();
}, 5000);
