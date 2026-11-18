# Imagem base: Node 22 sobre Debian "bookworm" na versão enxuta (slim).
# Debian (glibc) em vez de Alpine (musl) porque o bcrypt usa binário pré-compilado.
# Fixada por digest (sha256): o build usa sempre exatamente esta imagem, no CI e
# no Dokploy. O Dependabot abre um PR quando a tag ganha uma versão nova.
# O "AS base" dá um nome a esta imagem para os dois estágios abaixo reaproveitarem.
FROM node:22-bookworm-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee AS base

# Diz ao Node e às bibliotecas que estamos em produção.
ENV NODE_ENV=production

# Pasta de trabalho dentro do container; os comandos seguintes rodam a partir dela.
WORKDIR /app

# ---------- Estágio 1: instala as dependências ----------
FROM base AS deps

# Evita que o corepack pare o build perguntando se pode baixar o pnpm.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Ativa o corepack, que instala o pnpm na versão fixada no campo packageManager.
RUN corepack enable

# Copia só os arquivos de dependências. Enquanto eles não mudarem,
# o Docker reaproveita a camada do "pnpm install" e o build fica rápido.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala só as dependências de produção, exatamente como estão no lockfile.
RUN pnpm install --frozen-lockfile --prod

# ---------- Estágio 2: imagem final, a que roda em produção ----------
FROM base

# A API só precisa do "node" para rodar. Remove os gerenciadores de pacotes que
# vêm na imagem base (npm, npx, corepack e yarn): eles não são usados em produção
# e trazem dependências próprias com vulnerabilidades.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
      /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
      /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*

# Copia só as dependências instaladas no estágio 1 (sem o pnpm e seu cache).
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

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
