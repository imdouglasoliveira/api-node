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