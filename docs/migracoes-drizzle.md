# Guia de Migrações do Drizzle Kit

## Problema Identificado

O comando `npx drizzle-kit migrate` apresenta problemas de conectividade quando executado no Windows com Docker. O erro específico é:

```
DrizzleQueryError: Failed query: CREATE SCHEMA IF NOT EXISTS "drizzle"
cause: error: autenticação do tipo senha falhou para o usuário "postgres"
```

### Causa Raiz
- Problemas de conectividade entre Windows e container Docker PostgreSQL
- Diferenças de encoding e configuração de rede
- Limitações do driver PostgreSQL no ambiente Windows

## Solução Implementada

### Arquivos Criados

1. **`src/scripts/apply-migration.js`** - Script automatizado para aplicar migrações via Docker
2. **Scripts NPM** - Comandos simplificados para geração e aplicação de migrações

### Configuração dos Scripts

Adicionados ao `package.json`:

```json
{
  "scripts": {
    "migrate:generate": "npx drizzle-kit generate",
    "migrate": "node src/scripts/apply-migration.js",
    "db:setup": "npm run migrate:generate && npm run migrate",
    "db:reset": "docker compose down && docker compose up -d && npm run migrate"
  }
}
```

## Como Usar

### Fluxo Normal de Migração

1. **Modificar o schema** em `src/database/schema.ts`
2. **Gerar a migração:**
   ```bash
   npm run migrate:generate
   ```
3. **Aplicar a migração:**
   ```bash
   npm run migrate
   ```

### Comandos Disponíveis

| Comando | Descrição | Status |
|---------|-----------|--------|
| `npm run migrate:generate` | Gera arquivo SQL de migração | ✅ Funciona |
| `npm run migrate` | Aplica migrações via Docker | ✅ Funciona |
| `npm run db:setup` | Gera e aplica migrações em sequência | ✅ Funciona |
| `npm run db:reset` | Reinicia banco e aplica migrações | ✅ Funciona |
| `npm run db:check` | Verifica status do banco de dados | ✅ Funciona |
| `npx drizzle-kit migrate` | Aplicação direta (problemática) | ❌ Falha |

## Como o Script Funciona

### Processo de Aplicação

1. **Detecção:** Lista todos os arquivos `.sql` no diretório `./drizzle`
2. **Ordenação:** Organiza as migrações por ordem alfabética
3. **Transferência:** Copia cada arquivo para o container Docker
4. **Execução:** Executa o SQL via `psql` dentro do container
5. **Feedback:** Retorna status de sucesso ou erro

### Exemplo de Saída

```
📋 Migrações encontradas: 1
📦 Aplicando migração: drizzle\0000_sticky_monster_badoon.sql
✅ Migração aplicada com sucesso!
🎉 Todas as migrações foram aplicadas!
```

## Configuração Atual

### Banco de Dados
- **Host:** 127.0.0.1 (localhost)
- **Porta:** 5432
- **Usuário:** postgres
- **Senha:** simplepass123
- **Database:** api_node

### Container Docker
- **Nome:** api-node-db-1
- **Imagem:** postgres:17
- **Status:** Funcionando corretamente

## Estrutura de Arquivos

```
api-node/
├── src/
│   ├── database/
│   │   └── schema.ts          # Definição do schema
│   └── scripts/
│       ├── apply-migration.js # Script de aplicação de migrações
│       └── check-db.js        # Script de verificação do banco
├── drizzle/
│   ├── 0000_sticky_monster_badoon.sql  # Migrações geradas
│   └── meta/                  # Metadados do Drizzle
└── drizzle.config.ts          # Configuração do Drizzle Kit
```

## Troubleshooting

### Problemas Comuns

1. **Container não está rodando:**
   ```bash
   docker compose ps
   docker compose up -d
   ```

2. **Erro de permissão:**
   ```bash
   docker exec api-node-db-1 psql -U postgres -d api_node -c "SELECT version();"
   ```

3. **Migração já aplicada:**
   - O script ignora erros de tabela já existente
   - Continua com as próximas migrações

### Verificação de Status

```bash
# Verificar tabelas criadas
docker exec api-node-db-1 psql -U postgres -d api_node -c "\dt"

# Verificar migrações aplicadas
docker exec api-node-db-1 psql -U postgres -d api_node -c "SELECT * FROM drizzle.__drizzle_migrations;"
```

## Vantagens da Solução

- ✅ **Funciona perfeitamente** com Docker
- ✅ **Mantém o fluxo** do treinamento
- ✅ **Automatizado** - só executar 2 comandos
- ✅ **Compatível** com o Drizzle Kit
- ✅ **Não quebra** o workflow de desenvolvimento
- ✅ **Transparente** - usa os mesmos arquivos SQL gerados

## Limitações

- ❌ Não usa o comando oficial `drizzle-kit migrate`
- ⚠️ Requer Docker rodando para funcionar
- ⚠️ Depende do nome específico do container (`api-node-db-1`)
- ⚠️ Script localizado em `src/scripts/` (não na raiz)

## Próximos Passos

1. **Continuar o treinamento** normalmente
2. **Usar os comandos NPM** em vez do Drizzle Kit direto
3. **Reportar problemas** se encontrar erros específicos
4. **Considerar migração** para Linux/WSL se necessário

---

**Última atualização:** 28/09/2025  
**Status:** ✅ Funcionando  
**Versão do Drizzle Kit:** Latest (atualizada)
