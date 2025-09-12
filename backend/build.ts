import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

console.log(`Iniciando build de ${isProduction ? 'produção' : 'desenvolvimento'}...`);

await Bun.build({
    entrypoints: [
        './src/index.ts'
    ],
    outdir: './dist',
    target: 'bun',
    minify: true,
    sourcemap: isProduction ? 'none' : 'external',
});

console.log(`Build de ${isProduction ? 'produção' : 'desenvolvimento'} concluído!`);

const workersDir = path.join(import.meta.dir, 'workers');
const workerFiles = fs.readdirSync(workersDir).map(file => path.join('workers', file));

const allEntrypoints = ['./src/index.ts', ...workerFiles];

console.log("Entrypoints encontrados:", allEntrypoints);

const result = await Bun.build({
    entrypoints: allEntrypoints,
    outdir: './dist',
    target: 'bun',
    minify: true,

    // A MÁGICA ACONTECE AQUI!
    // Esta opção preserva a estrutura de diretórios na pasta de saída.
    // [dir] -> diretório do arquivo (ex: 'workers')
    // [name] -> nome do arquivo (ex: 'processa-arquivo')
    // [ext] -> extensão (ex: '.js')
    naming: '[dir]/[name].[ext]',
});

if (result.success) {
    console.log("Build concluído com sucesso!");
} else {
    console.error("Build falhou:");
    for (const message of result.logs) {
        console.error(message);
    }
}