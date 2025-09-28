# Configuração do Banco PostgreSQL

Este documento explica a configuração do ambiente PostgreSQL para desenvolvimento local.

**Nota:** O Drizzle Studio apresenta problemas de compatibilidade com PostgreSQL 17 em containers Docker. Para gerenciamento visual do banco, recomenda-se usar ferramentas como pgAdmin, DBeaver ou similar.

## Problema Identificado

O Drizzle Studio apresentava erro de autenticação ao tentar conectar com o banco PostgreSQL:

```
Error: autenticação do tipo senha falhou para o usuário "postgres"
```

## Causa do Problema

O problema estava na configuração de autenticação do PostgreSQL no container Docker. O arquivo `pg_hba.conf` gerado automaticamente tinha configurações conflitantes:

1. **Configurações locais**: Permitiam conexões `trust` (sem senha) para `127.0.0.1/32`
2. **Configuração global**: A última linha `host all all all scram-sha-256` sobrescrevia as configurações anteriores, forçando autenticação por senha para todas as conexões

## Solução Implementada

### 1. Configuração do Docker Compose

Adicionamos a variável de ambiente `POSTGRES_HOST_AUTH_METHOD=md5` no `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:17
    environment:
      - POSTGRES_DB=api_node
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=senha123
      - POSTGRES_HOST_AUTH_METHOD=md5  # ← Linha adicionada
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
```

### 2. Simplificação da Senha

Mudamos a senha de `Senh4_123` para `senha123` para evitar problemas de encoding com caracteres especiais.

**Arquivos alterados:**
- `docker-compose.yml`: `POSTGRES_PASSWORD=senha123`
- `.env`: `DATABASE_URL=postgresql://postgres:senha123@127.0.0.1:5432/api_node`

### 3. Recriação Completa do Banco

```bash
# Parar containers
docker compose down

# Remover volume antigo
docker volume rm api-node_postgres_data

# Recriar com nova configuração
docker compose up -d

# Aplicar migrações
npm run migrate
```

## Como Iniciar o Drizzle Studio

### ✅ Método Recomendado (Automatizado):

1. **Certifique-se que o banco está rodando:**
   ```bash
   docker compose up -d
   ```

2. **Inicie o Drizzle Studio com script automatizado:**
   ```bash
   npm run studio
   ```

   Este comando:
   - ✅ Mata automaticamente qualquer processo anterior na porta 4983
   - ✅ Inicia o Drizzle Studio sem conflitos de porta
   - ✅ Mostra logs detalhados do processo

3. **Acesse no navegador:**
   ```
   https://local.drizzle.studio
   ```

4. **Para parar o Studio:**
   Pressione `Ctrl+C` no terminal

### 🔧 Método Manual (Caso necessário):

Se preferir usar o comando original:

1. **Mate processos anteriores (se necessário):**
   ```bash
   npm run studio:kill
   ```

2. **Inicie o Drizzle Studio:**
   ```bash
   npx drizzle-kit studio
   ```

## Scripts Úteis

O projeto possui scripts configurados no `package.json`:

```json
{
  "scripts": {
    "studio": "node src/scripts/drizzle/start-studio.js",
    "studio:kill": "node src/scripts/drizzle/kill-studio-port.js",
    "migrate:generate": "npx drizzle-kit generate",
    "migrate": "node src/scripts/apply-migration.js",
    "db:setup": "npm run migrate:generate && npm run migrate",
    "db:reset": "docker compose down && docker compose up -d && npm run migrate"
  }
}
```

### Comandos Úteis:

#### 🎯 Drizzle Studio:
- **Iniciar Studio (automatizado):** `npm run studio`
- **Matar processos do Studio:** `npm run studio:kill`

#### 🗄️ Banco de Dados:
- **Reset completo do banco:** `npm run db:reset`
- **Gerar migrações:** `npm run migrate:generate`
- **Aplicar migrações:** `npm run migrate`
- **Setup inicial:** `npm run db:setup`

## Configuração Final

### docker-compose.yml
```yaml
services:
  db:
    image: postgres:17
    environment:
      - POSTGRES_DB=api_node
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=senha123
      - POSTGRES_HOST_AUTH_METHOD=md5
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
```

### .env
```
DATABASE_URL=postgresql://postgres:senha123@127.0.0.1:5432/api_node
```

### drizzle.config.ts
```typescript
import { config } from 'dotenv';
config();

import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    out: './drizzle',
    schema: './src/database/schema.ts',
});
```

## Troubleshooting

### Se o erro persistir:

1. **Verifique se o container está rodando:**
   ```bash
   docker ps
   ```

2. **Verifique os logs do PostgreSQL:**
   ```bash
   docker logs api-node-db-1
   ```

3. **Teste a conexão diretamente:**
   ```bash
   docker exec api-node-db-1 psql -U postgres -d api_node -c "SELECT 1;"
   ```

4. **Use o script automatizado para matar processos:**
   ```bash
   npm run studio:kill
   ```

5. **Método manual (se necessário):**
   ```bash
   # Encontrar processo na porta 4983
   netstat -ano | findstr :4983

   # Matar processo (substitua PID pelo número encontrado)
   powershell "Stop-Process -Id PID -Force"
   ```

### Dicas Importantes:

- **Senhas**: Use senhas simples sem caracteres especiais para evitar problemas de URL encoding
- **Reset completo**: Sempre que alterar credenciais, execute `npm run db:reset`
- **Porta ocupada**: Se der erro de porta em uso, mate o processo anterior do Drizzle Studio
- **Aguarde inicialização**: Após `docker compose up -d`, aguarde alguns segundos antes de aplicar migrações

## Scripts Automatizados Criados

Para resolver definitivamente o problema de porta ocupada, foram criados scripts especializados:

### `src/scripts/drizzle/kill-studio-port.js`
Script que:
- ✅ Verifica processos na porta 4983
- ✅ Mata automaticamente qualquer processo encontrado
- ✅ Fornece feedback detalhado das ações executadas
- ✅ Funciona tanto no Windows quanto em sistemas Unix

### `src/scripts/drizzle/start-studio.js`
Script integrado que:
- ✅ Executa primeiro o kill-studio-port.js
- ✅ Inicia o Drizzle Studio sem conflitos
- ✅ Manuseia sinais (Ctrl+C) corretamente
- ✅ Fornece logs informativos do processo

### Comandos Disponíveis:
```bash
# Comando principal - use sempre este
npm run studio

# Comando auxiliar - mata apenas os processos
npm run studio:kill
```

## Resultado

Após seguir estes passos, o Drizzle Studio funcionará corretamente em `https://local.drizzle.studio`, permitindo:

- Visualizar tabelas e dados
- Adicionar novos registros
- Editar registros existentes
- Executar queries diretamente na interface
- Navegar pelo schema do banco de dados

**O comando `npm run studio` agora resolve automaticamente qualquer conflito de porta e garante que o Studio inicie corretamente em todas as vezes!**