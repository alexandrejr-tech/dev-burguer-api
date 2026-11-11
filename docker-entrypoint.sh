#!/bin/sh
# Para o script no primeiro erro: se a migration falhar, a API não sobe.
set -e

echo "Rodando as migrations do Sequelize..."
node_modules/.bin/sequelize-cli db:migrate

echo "Iniciando a API..."
# exec substitui o shell pelo Node, que passa a receber os sinais de desligar
# (docker stop) diretamente e encerra de forma limpa.
exec node src/server.js
