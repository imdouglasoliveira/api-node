# Configuração do Drizzle Studio + SQLite

Este documento explica como configurar e usar o Drizzle Studio com SQLite para desenvolvimento local.

## ✅ Solução SQLite Implementada

Com SQLite não há problemas de conectividade! O Drizzle Studio funciona perfeitamente com o banco local.

### Vantagens do SQLite + Drizzle Studio:
- ✅ **Sem Docker**: Não precisa de containers
- ✅ **Zero Configuração**: Funciona out-of-the-box
- ✅ **Performance**: Mais rápido para desenvolvimento
- ✅ **Compatibilidade**: Funciona perfeitamente no Windows
- ✅ **Interface Gráfica**: Drizzle Studio funciona perfeitamente

## Como Iniciar o Drizzle Studio

### ✅ Método Recomendado:

1. **Certifique-se que o banco está configurado:**
   ```bash
   npm run db:check
   ```

2. **Inicie o Drizzle Studio:**
   ```bash
   npm run drizzle:studio
   ```

3. **Acesse no navegador:**
   ```
   https://local.drizzle.studio
   ```

4. **Para parar o Studio:**
   Pressione `Ctrl+C` no terminal

## Scripts Disponíveis

O projeto possui scripts configurados no `package.json`:

```json
{
  "scripts": {
    "drizzle:studio": "npx drizzle-kit studio",
    "migrate:generate": "npx drizzle-kit generate",
    "migrate": "node src/scripts/apply-migration.js",
    "db:setup": "npm run migrate:generate && npm run migrate",
    "db:reset": "powershell \"Remove-Item -Force dev.db -ErrorAction SilentlyContinue\" && npm run migrate",
    "db:check": "node src/scripts/check-db.js"
  }
}
```

### Comandos Úteis:

#### 🎯 Drizzle Studio:
- **Iniciar Studio:** `npm run drizzle:studio`

#### 🗄️ Banco de Dados SQLite:
- **Verificar status:** `npm run db:check`
- **Reset completo:** `npm run db:reset`
- **Gerar migrações:** `npm run migrate:generate`
- **Aplicar migrações:** `npm run migrate`
- **Setup inicial:** `npm run db:setup`

## Configuração Atual

### drizzle.config.ts
```typescript
import { config } from 'dotenv';
config();

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/database/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: './dev.db',
    }
});
```

### Banco SQLite
- **Arquivo:** `./dev.db`
- **Tipo:** SQLite 3
- **Localização:** Raiz do projeto
- **Status:** Funcionando perfeitamente

## Funcionalidades do Drizzle Studio

Com SQLite, o Drizzle Studio oferece:

- ✅ **Visualização de tabelas** e dados
- ✅ **Adicionar novos registros** diretamente na interface
- ✅ **Editar registros existentes**
- ✅ **Executar queries** diretamente na interface
- ✅ **Navegar pelo schema** do banco de dados
- ✅ **Interface responsiva** e intuitiva

## Troubleshooting

### Problemas Comuns

1. **Arquivo dev.db não encontrado:**
   ```bash
   npm run migrate
   ```

2. **Banco corrompido:**
   ```bash
   npm run db:reset
   ```

3. **Verificar status:**
   ```bash
   npm run db:check
   ```

4. **Porta ocupada (raro com SQLite):**
   - Pressione `Ctrl+C` para parar o Studio
   - Aguarde alguns segundos
   - Execute `npm run drizzle:studio` novamente

### Verificação de Status

```bash
# Verificar status do banco
npm run db:check

# Verificar se o arquivo dev.db existe
ls dev.db  # Linux/Mac
dir dev.db # Windows
```

## Vantagens da Solução SQLite

- ✅ **Funciona perfeitamente** no Windows
- ✅ **Sem Docker** necessário
- ✅ **Drizzle Studio** funciona sem problemas
- ✅ **Performance** superior para desenvolvimento
- ✅ **Zero configuração** de rede
- ✅ **Arquivo único** fácil de versionar
- ✅ **Compatibilidade** total com Drizzle ORM

## Migração para Produção

Quando necessário migrar para PostgreSQL em produção:

1. **Manter schema** compatível entre SQLite e PostgreSQL
2. **Usar Drizzle ORM** que abstrai as diferenças
3. **Configurar** `drizzle.config.ts` para PostgreSQL
4. **Aplicar migrações** no ambiente de produção

## Resultado

Após seguir estes passos, o Drizzle Studio funcionará corretamente em `https://local.drizzle.studio`, permitindo:

- Visualizar tabelas e dados do SQLite
- Adicionar novos registros
- Editar registros existentes
- Executar queries diretamente na interface
- Navegar pelo schema do banco de dados

**O comando `npm run drizzle:studio` funciona perfeitamente com SQLite e não apresenta problemas de conectividade!**

---

**Última atualização:** 28/09/2025  
**Status:** ✅ Funcionando perfeitamente  
**Banco:** SQLite 3.50.4