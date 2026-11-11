# Imagem base: Node 22 sobre Debian "bookworm" na versão enxuta (slim).
# Debian (glibc) em vez de Alpine (musl) porque o bcrypt usa binário pré-compilado.
FROM node:22-bookworm-slim

# Diz ao Node e às bibliotecas que estamos em produção.
ENV NODE_ENV=production
# Evita que o corepack pare o build perguntando se pode baixar o pnpm.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Pasta de trabalho dentro do container; os comandos seguintes rodam a partir dela.
WORKDIR /app

# Ativa o corepack, que instala o pnpm na versão fixada no campo packageManager.
RUN corepack enable

# Copia só os arquivos de dependências primeiro. Enquanto eles não mudarem,
# o Docker reaproveita a camada do "pnpm install" e o build fica rápido.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala só as dependências de produção, exatamente como estão no lockfile.
RUN pnpm install --frozen-lockfile --prod

# Copia o resto do código (o .dockerignore deixa de fora node_modules, .env, .git...).
# --chown entrega os arquivos ao usuário "node", que vai rodar a API.
COPY --chown=node:node . .

# Garante que o script de entrada pode ser executado.
RUN chmod +x docker-entrypoint.sh

# Daqui em diante o container roda como o usuário "node", sem privilégios de root.
USER node

# Documenta a porta em que a API escuta dentro do container (não publica nada).
EXPOSE 3001

# Comando executado quando o container sobe: roda as migrations e inicia a API.
ENTRYPOINT ["./docker-entrypoint.sh"]
