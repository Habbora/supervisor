const worker = new Worker("worker.ts");

console.log("Iniciado");

worker.postMessage({
  type: "init",
  payload: {},
});
