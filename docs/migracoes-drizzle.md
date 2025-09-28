# Guia de Migrações do Drizzle Kit + SQLite

## ✅ Solução SQLite Implementada

Com SQLite não há problemas de conectividade! O banco é um arquivo local que funciona perfeitamente no Windows.

### Vantagens do SQLite:
- ✅ **Sem Docker**: Não precisa de containers
- ✅ **Zero Configuração**: Funciona out-of-the-box
- ✅ **Performance**: Mais rápido para desenvolvimento
- ✅ **Compatibilidade**: Funciona perfeitamente no Windows
- ✅ **Portabilidade**: Arquivo único `dev.db`

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
| `npm run migrate` | Aplica migrações no SQLite | ✅ Funciona |
| `npm run db:setup` | Gera e aplica migrações em sequência | ✅ Funciona |
| `npm run db:reset` | Reseta banco e aplica migrações | ✅ Funciona |
| `npm run db:check` | Verifica status do banco SQLite | ✅ Funciona |
| `npm run drizzle:studio` | Abre interface gráfica do Drizzle | ✅ Funciona |

## Como o Script Funciona

### Processo de Aplicação SQLite

1. **Detecção:** Lista todos os arquivos `.sql` no diretório `./drizzle`
2. **Ordenação:** Organiza as migrações por ordem alfabética
3. **Execução:** Executa o SQL diretamente no arquivo `dev.db`
4. **Feedback:** Retorna status de sucesso ou erro

### Exemplo de Saída

```
📋 Migrações encontradas: 1
📦 Aplicando migração: drizzle\0000_productive_sphinx.sql
✅ Migração aplicada com sucesso!
🎉 Todas as migrações foram aplicadas!
```

## Configuração Atual

### Banco de Dados SQLite
- **Arquivo:** `./dev.db`
- **Tipo:** SQLite 3
- **Localização:** Raiz do projeto
- **Status:** Funcionando perfeitamente

## Estrutura de Arquivos

```
api-node/
├── src/
│   ├── database/
│   │   ├── schema.ts          # Definição do schema SQLite
│   │   └── client.ts          # Cliente SQLite
│   └── scripts/
│       ├── apply-migration.js  # Script de aplicação de migrações
│       └── check-db.js         # Script de verificação do banco
├── drizzle/
│   ├── 0000_productive_sphinx.sql  # Migrações geradas
│   └── meta/                  # Metadados do Drizzle
├── dev.db                     # Arquivo do banco SQLite
└── drizzle.config.ts         # Configuração do Drizzle Kit
```

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

### Verificação de Status

```bash
# Verificar status do banco
npm run db:check

# Abrir Drizzle Studio para visualizar dados
npm run drizzle:studio
```

## Vantagens da Solução SQLite

- ✅ **Funciona perfeitamente** no Windows
- ✅ **Sem Docker** necessário
- ✅ **Mantém o fluxo** do treinamento
- ✅ **Automatizado** - só executar 2 comandos
- ✅ **Compatível** com o Drizzle Kit
- ✅ **Não quebra** o workflow de desenvolvimento
- ✅ **Transparente** - usa os mesmos arquivos SQL gerados
- ✅ **Performance** superior para desenvolvimento

## Migração para Produção

Quando necessário migrar para PostgreSQL em produção:

1. **Manter schema** compatível entre SQLite e PostgreSQL
2. **Usar Drizzle ORM** que abstrai as diferenças
3. **Configurar** `drizzle.config.ts` para PostgreSQL
4. **Aplicar migrações** no ambiente de produção

---

**Última atualização:** 28/09/2025  
**Status:** ✅ Funcionando perfeitamente  
**Banco:** SQLite 3.50.4