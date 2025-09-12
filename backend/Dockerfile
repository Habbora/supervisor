FROM oven/bun:1-slim

WORKDIR /app

COPY . .

RUN rm -rf node_modules
RUN bun install

RUN mkdir -p /app/data && chmod 777 /app/database

RUN addgroup --system --gid 1001 supervisor
RUN adduser --system --uid 1001 supervisor
RUN chown -R supervisor:supervisor /app
USER supervisor

EXPOSE 4001

VOLUME ["/app/database"]

CMD ["bun", "start"]