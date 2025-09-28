# Informações gerais
1. Para criar o arquivo package inicial usamos:
```bash
npm init -y
````
2. Instalar o fastity usando:
```bash
npm i fastify
````
3. Rodar as alterações em tempo real:
```bash
node --watch server.js
````
4. Instalar o typescript:
```bash
npm i typescript @types/node -D
````
5. Iniciar o typescript:
```bash
npx tsc --init
````
6. Acessar o repositório [tsconfig/bases](https://github.com/tsconfig/bases?tab=readme-ov-file#node-22-tsconfigjson) e clicar em `tsconfig.json`, copiar o valor e substituir no arquivo de tsconfig.
7. Instalar o pino para logger:
```bash
npm i pino-pretty
````
8. Instalar o Drizzle:
```bash
npm i drizzle-kit -D // -D: para setar que é dependencia de desenvolvimento
npm i drizzle-orm pg
````
8. Instalar o dotenv:
```bash
npm install dotenv
````

# Drizzle
1. Criar sql das tables do arquivo `schema.ts`:
```bash
npm run migrate:generate
````
2. Aplicar migrações (usar comando personalizado):
```bash
npm run migrate
````
3. Comandos úteis adicionais:
```bash
npm run db:setup  # Gerar e aplicar migrações em sequência
npm run db:reset  # Reiniciar banco e aplicar migrações
npm run db:check  # Verificar status do banco de dados
````
4. Abrir o studio do Drizzle:
```bash
npx drizzle-kit studio
````

> **⚠️ IMPORTANTE:** O comando `npx drizzle-kit migrate` apresenta problemas no Windows com Docker. Use os comandos NPM acima. Veja [Guia de Migrações](./migracoes-drizzle.md) para detalhes.

# Gerenciamento de versões Node.js com nvm
4. Ver versões instaladas do Node.js:
```bash
nvm list
````
5. Instalar versão LTS do Node.js:
```bash
nvm install lts
````
6. Usar versão específica do Node.js:
```bash
nvm use 20.12.2
````
7. Usar versão definida no arquivo .nvmrc:
```bash
nvm use
````
8. Definir versão padrão do Node.js:
```bash
nvm alias default 20.12.2
````

# Docker
# Construir e executar
docker-compose up --build

# Executar em background
## Rodar sem manter o terminal aberto
docker-compose up -d --build

# Visualizar os serviços
docker-compose ps

# Parar os serviços
docker-compose down

# Conecte ao PostgreSQL e verifique se o banco existe:
```bash
docker exec -it <container_id> psql -U postgres -c "\l"
```
