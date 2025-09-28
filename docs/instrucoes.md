# Informações gerais
1. Para criar o arquivo package inicial usamos:
```bash
npm init -y
```

2. Instalar o Fastify:
```bash
npm i fastify
```

3. Rodar as alterações em tempo real:
```bash
npm run dev
```

4. Instalar o TypeScript:
```bash
npm i typescript @types/node -D
```

5. Iniciar o TypeScript:
```bash
npx tsc --init
```

6. Acessar o repositório [tsconfig/bases](https://github.com/tsconfig/bases?tab=readme-ov-file#node-22-tsconfigjson) e clicar em `tsconfig.json`, copiar o valor e substituir no arquivo de tsconfig.

7. Instalar o pino para logger:
```bash
npm i pino-pretty
```

8. Instalar o Drizzle e SQLite:
```bash
npm i drizzle-kit -D  # Dependência de desenvolvimento
npm i drizzle-orm better-sqlite3
npm i @types/better-sqlite3 -D
```

9. Instalar o dotenv:
```bash
npm install dotenv
```

# Drizzle + SQLite
1. Criar SQL das tabelas do arquivo `schema.ts`:
```bash
npm run migrate:generate
```

2. Aplicar migrações:
```bash
npm run migrate
```

3. Comandos úteis adicionais:
```bash
npm run db:setup      # Gerar e aplicar migrações em sequência
npm run db:reset      # Resetar banco e aplicar migrações
npm run db:check      # Verificar status do banco de dados
```

4. Abrir o Drizzle Studio:
```bash
npm run drizzle:studio
```

> **✅ VANTAGEM:** Com SQLite não há problemas de conectividade no Windows. Tudo funciona perfeitamente!

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

# SQLite - Banco de Dados Local
Com SQLite não precisamos de Docker! O banco é um arquivo local `dev.db`.

## Vantagens do SQLite:
- ✅ **Simplicidade**: Sem necessidade de Docker
- ✅ **Performance**: Mais rápido para desenvolvimento
- ✅ **Compatibilidade**: Funciona perfeitamente no Windows
- ✅ **Portabilidade**: Arquivo único `dev.db`
- ✅ **Zero Configuração**: Funciona out-of-the-box

## Comandos SQLite:
```bash
# Verificar status do banco
npm run db:check

# Resetar banco (remove e recria)
npm run db:reset

# Abrir Drizzle Studio para visualizar dados
npm run drizzle:studio
```
