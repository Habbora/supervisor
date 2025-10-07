FROM oven/bun:1-slim

WORKDIR /app

COPY . .

ENV NODE_ENV=production
ENV API_URL=http://backend:4001

RUN bun install
RUN bun run build

RUN addgroup --system --gid 1001 supervisor
RUN adduser --system --uid 1001 supervisor
RUN chown -R supervisor:supervisor /app
USER supervisor

EXPOSE 3000

CMD ["bun", "start"]
