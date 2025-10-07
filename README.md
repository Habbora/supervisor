# Supervisor - Sistema de Controle Industrial

Sistema de supervisão e controle de dispositivos industriais/automáticos desenvolvido com tecnologias modernas.

## 🏗️ Arquitetura

- **Backend**: Bun + TypeScript + Drizzle ORM + SQLite
- **Frontend**: Next.js 15 + React 19 + TypeScript + TailwindCSS
- **Comunicação**: WebSocket + API REST + Modbus TCP/IP
- **Containerização**: Docker + Docker Compose

## 📁 Estrutura do Projeto

```
supervisor/
├── backend/           # API e serviços backend
├── frontend/          # Interface web Next.js
├── driver_demo/       # Demonstração de drivers
├── docs/              # Documentação do projeto
├── docker-compose.yml # Configuração Docker
└── README.md          # Este arquivo
```

## 🚀 Como Executar

### Desenvolvimento Local

```bash
# Backend
cd backend
bun install
bun run dev

# Frontend
cd frontend
bun install
bun run dev
```

### Produção com Docker

```bash
docker-compose up -d
```

## 🔧 Funcionalidades

- ✅ Controle de iluminação
- ✅ Sistema hidráulico (bombas, válvulas, sensores)
- ✅ Monitoramento de níveis de reservatórios
- ✅ Interface web responsiva
- ✅ Autenticação JWT
- ✅ Comunicação Modbus TCP/IP
- ✅ WebSocket para tempo real

## 📋 Pré-requisitos

- [Bun](https://bun.sh) (runtime JavaScript)
- [Docker](https://docker.com) (opcional)
- Node.js 18+ (para compatibilidade)

## 📖 Documentação

- [Documentação Completa](.cursor/README.md)
- [Guia de Contribuição](backend/docs/CONTRIBUTING.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

### 2. Arquivo de configuração do ambiente

```env:.env.example
# Configuração do Backend
NODE_ENV=development
PORT=4001
DATABASE_URL=file:./database/supervisor.db

# Configuração do Frontend
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:4001

# Configuração JWT
JWT_SECRET=your-secret-key-here

# Configuração Modbus
MODBUS_TIMEOUT=5000
MODBUS_RETRY_ATTEMPTS=3
```

### 3. Scripts de desenvolvimento

```json:package.json
{
  "name": "supervisor",
  "version": "1.0.0",
  "description": "Sistema de supervisão e controle industrial",
  "private": true,
  "scripts": {
    "dev": "concurrently \"bun run dev:backend\" \"bun run dev:frontend\"",
    "dev:backend": "cd backend && bun run dev",
    "dev:frontend": "cd frontend && bun run dev",
    "build": "bun run build:backend && bun run build:frontend",
    "build:backend": "cd backend && bun run build",
    "build:frontend": "cd frontend && bun run build",
    "start": "docker-compose up -d",
    "stop": "docker-compose down",
    "logs": "docker-compose logs -f",
    "clean": "bun run clean:backend && bun run clean:frontend",
    "clean:backend": "cd backend && rm -rf node_modules bun.lockb",
    "clean:frontend": "cd frontend && rm -rf node_modules bun.lockb .next"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "workspaces": [
    "backend",
    "frontend",
    "driver_demo"
  ]
}
```

### 4. Arquivo de licença

```text:LICENSE
MIT License

Copyright (c) 2024 Supervisor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 5. Arquivo de configuração do editor

```json:.editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### 6. Atualizar o .gitignore

```gitignore:.gitignore
# Dependencies
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
bun.lockb

# Environment files
.env
.env.local
.env.*.local

# IDE files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Build outputs
dist/
build/
out/
.next/

# Database
*.db
*.db-shm
*.db-wal

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
```

## Resumo das Melhorias

1. **README.md principal**: Documentação completa do projeto
2. **package.json raiz**: Scripts para gerenciar todo o projeto
3. **.env.example**: Template de configuração de ambiente
4. **LICENSE**: Licença MIT para o projeto
5. **.editorconfig**: Configuração consistente do editor
6. **.gitignore atualizado**: Melhor controle de arquivos ignorados

## Próximos Passos

1. Instalar as dependências no root: `bun install`
2. Copiar `.env.example` para `.env` e configurar as variáveis
3. Testar os scripts: `bun run dev` (executa backend e frontend juntos)
4. Adicionar mais documentação conforme necessário

Essa organização torna o projeto mais profissional e fácil de usar para outros desenvolvedores. O que você acha dessa estrutura? Gostaria que eu ajuste alguma coisa ou adicione mais algum arquivo?
