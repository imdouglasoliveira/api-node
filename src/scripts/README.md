# Scripts do Projeto API Node.js

Esta pasta contém todos os scripts utilitários do projeto, organizados por categoria.

## 📁 Estrutura

```
src/scripts/
├── database/           # Scripts de banco de dados
│   ├── index.js        # Ponto de entrada dos scripts de DB
│   ├── apply-migration.js  # Aplicar migrações SQLite
│   └── check-db.js     # Verificar status do banco
├── git/                # Scripts de Git e deploy
│   ├── index.js        # Ponto de entrada dos scripts Git
│   ├── deploy.js       # Deploy automático (dev → beta → main)
│   ├── push-dev.js     # Push para branch dev
│   ├── status.js       # Status detalhado do repositório
│   └── cleanup.js      # Limpeza do repositório
└── README.md          # Este arquivo
```

## 🗄️ Scripts de Banco de Dados

### Comandos Disponíveis

- `npm run db:migrate` - Aplicar migrações do banco
- `npm run db:check` - Verificar status do banco
- `npm run db:help` - Mostrar ajuda dos scripts de DB

### Scripts Individuais

- `node src/scripts/database/apply-migration.js` - Aplicar migrações
- `node src/scripts/database/check-db.js` - Verificar status

## 🌿 Scripts de Git

### Comandos Disponíveis

- `npm run git:deploy [mensagem]` - Deploy automático
- `npm run git:push-dev [mensagem]` - Push para branch dev
- `npm run git:status` - Status do repositório
- `npm run git:cleanup [--force]` - Limpeza do repositório
- `npm run git:help` - Mostrar ajuda dos scripts Git

### Comandos Simplificados

- `npm run deploy [mensagem]` - Deploy automático
- `npm run push-dev [mensagem]` - Push para branch dev
- `npm run status` - Status do repositório
- `npm run cleanup [--force]` - Limpeza do repositório

### Scripts Individuais

- `node src/scripts/git/deploy.js [mensagem]` - Deploy automático
- `node src/scripts/git/push-dev.js [mensagem]` - Push para branch dev
- `node src/scripts/git/status.js` - Status detalhado
- `node src/scripts/git/cleanup.js [--force]` - Limpeza

## 📤 Push para Branch Dev

O script de push-dev automatiza o envio para a branch dev:

1. **Verificação** - Confirma se há alterações para commit
2. **Adição** - Adiciona todos os arquivos ao staging
3. **Commit** - Faz commit com mensagem personalizada ou padrão
4. **Push** - Envia para `origin/dev`

### Exemplo de Uso

```bash
# Push com mensagem personalizada
npm run push-dev "fix: correção de bug"

# Push com mensagem padrão
npm run push-dev
```

## 🚀 Deploy Automático

O script de deploy automatiza todo o fluxo:

1. **Verificação** - Confirma que está na branch `dev`
2. **Commit** - Adiciona arquivos e faz commit
3. **Push** - Envia para `origin/dev`
4. **Merge dev → beta** - Faz merge e push
5. **Merge beta → main** - Faz merge e push
6. **Retorno** - Volta para a branch `dev`

### Exemplo de Uso

```bash
# Deploy com mensagem personalizada
npm run deploy "feat: adicionar nova funcionalidade"

# Deploy com mensagem padrão
npm run deploy
```

## 🔍 Status do Repositório

O script de status mostra:

- Branch atual
- Alterações não commitadas
- Últimos commits
- Status das branches
- Status dos remotos

### Exemplo de Uso

```bash
npm run status
```

## 🧹 Limpeza do Repositório

O script de limpeza remove:

- Alterações não commitadas (com confirmação)
- Arquivos não rastreados
- Branches locais órfãs
- Cache do Git

### Exemplo de Uso

```bash
# Limpeza interativa
npm run cleanup

# Limpeza automática (sem confirmação)
npm run cleanup --force
```

## 💡 Dicas de Uso

### Fluxo de Desenvolvimento

1. **Desenvolvimento** - Faça suas alterações
2. **Verificação** - `npm run status` para ver o que mudou
3. **Push Dev** - `npm run push-dev "sua mensagem"` para enviar para dev
4. **Deploy** - `npm run deploy "sua mensagem"` para publicar em todas as branches
5. **Limpeza** - `npm run cleanup` quando necessário

### Comandos Essenciais

```bash
# Verificar status
npm run status

# Push para dev
npm run push-dev "fix: correção de bug"

# Fazer deploy completo
npm run deploy "feat: nova funcionalidade"

# Limpar repositório
npm run cleanup

# Verificar banco
npm run db:check

# Aplicar migrações
npm run db:migrate
```

## 🔧 Configuração

### Variáveis de Ambiente

Os scripts usam as seguintes variáveis:

- `NODE_ENV` - Ambiente de execução
- `DATABASE_URL` - URL do banco (se necessário)

### Permissões

Certifique-se de que os scripts têm permissão de execução:

```bash
# Linux/Mac
chmod +x src/scripts/git/*.js
chmod +x src/scripts/database/*.js
```

## 📚 Documentação Relacionada

- [docs/README.md](../../docs/README.md) - Documentação principal
- [docs/migracoes-drizzle.md](../../docs/migracoes-drizzle.md) - Guia de migrações
- [docs/drizzle-studio-setup.md](../../docs/drizzle-studio-setup.md) - Configuração do Studio

## 🐛 Troubleshooting

### Problemas Comuns

1. **Script não encontrado** - Verifique se está na raiz do projeto
2. **Permissão negada** - Execute com `node` explicitamente
3. **Branch incorreta** - Use `git checkout dev` antes do deploy
4. **Conflitos de merge** - Resolva manualmente e tente novamente

### Logs e Debug

Os scripts mostram logs coloridos para facilitar o debug:

- 🔄 **Azul** - Operação em andamento
- ✅ **Verde** - Sucesso
- ❌ **Vermelho** - Erro
- ⚠️ **Amarelo** - Aviso
- 💡 **Ciano** - Dica

---

**Última atualização:** 29/09/2025  
**Versão:** 1.0.0
