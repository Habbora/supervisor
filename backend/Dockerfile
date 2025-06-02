# Usando a imagem oficial do Bun slim
FROM oven/bun:1-slim

# Definindo o diretório de trabalho
WORKDIR /app

# Copiando todos os arquivos
COPY . .

# Instalando dependências
RUN bun install --frozen-lockfile
RUN chmod 777 /app/data

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["bun", "start"]  
