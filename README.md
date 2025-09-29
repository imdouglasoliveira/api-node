# API Node.js - Projeto de Estudo

API simples em Node.js + TypeScript usando Fastify para gerenciamento de cursos. Projeto desenvolvido para fins de estudo e aprendizado.

## Requisitos
- Node.js 20.12.2+ (recomendado usar .nvmrc)
- npm (ou outro gerenciador de pacotes)

## Tecnologias
- **Fastify 5** - Framework web rápido e eficiente
- **TypeScript** - Superset do JavaScript com tipagem estática
- **tsx** - Executor TypeScript para desenvolvimento
- **pino-pretty** - Logger formatado para desenvolvimento
- **SQLite** - Banco de dados embarcado para desenvolvimento
- **Drizzle ORM** - ORM moderno e type-safe

## Configuração
1. Clone o repositório e acesse a pasta do projeto:
```bash
git clone <url-do-repositorio>
cd api-node
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npm run db:setup
```

## Executando o servidor

### Desenvolvimento (com hot reload)
```bash
npm run dev
```

### Produção
```bash
npm run build
npm run start:prod
```

### Execução direta
```bash
npm start
```

- **Porta padrão**: `http://localhost:3333`
- **Logs**: Habilitados com formatação legível

## Endpoints
Base URL: `http://localhost:3333`

### GET `/courses`
Lista todos os cursos disponíveis.

**Resposta:**
```json
{
  "result": [
    { "id": 1, "title": "Curso de Node.js", "created_at": "2024-01-01T00:00:00.000Z", "updated_at": "2024-01-01T00:00:00.000Z" },
    { "id": 2, "title": "Curso de React", "created_at": "2024-01-01T00:00:00.000Z", "updated_at": "2024-01-01T00:00:00.000Z" }
  ],
  "total": 2
}
```

### GET `/courses/:id`
Busca um curso específico pelo ID.

**Parâmetros:**
- `id` (number) - ID do curso

**Respostas:**
- **200**: `{ "course": { "id": 1, "title": "Curso de Node.js", "created_at": "2024-01-01T00:00:00.000Z", "updated_at": "2024-01-01T00:00:00.000Z" } }`
- **404**: Curso não encontrado

### POST `/courses`
Cria um novo curso ou múltiplos cursos.

**Para criar um curso:**

**Body (JSON):**
```json
{
  "title": "Nome do Curso"
}
```

**Respostas:**
- **201**: `{ "courseId": 1 }`
- **400**: `{ "error": "Nome do curso é obrigatório" }`

**Para criar múltiplos cursos:**

**Body (JSON Array):**
```json
[
  { "title": "Curso de TypeScript" },
  { "title": "Curso de Docker" },
  { "title": "Curso de PostgreSQL" }
]
```

**Respostas:**
- **201**: `{ "courses": [{ "id": 1, "title": "Curso de TypeScript" }, { "id": 2, "title": "Curso de Docker" }], "total": 2 }`
- **400**: `{ "error": "Array de cursos não pode estar vazio" }` ou `{ "error": "Todos os cursos devem ter um título" }`
- **500**: `{ "error": "Erro ao criar cursos" }`

## Estrutura do Projeto
```
api-node/
├── docs/                 # Documentação técnica (local)
│   ├── README.md         # Visão geral da documentação
│   ├── instrucoes.md     # Instruções de setup
│   ├── migracoes-drizzle.md  # Guia de migrações
│   └── drizzle-studio-setup.md  # Configuração do Studio
├── drizzle/              # Migrações do banco de dados
├── src/
│   ├── database/         # Schema e cliente do banco
│   │   ├── schema.ts     # Definição das tabelas
│   │   ├── client.ts     # Cliente SQLite
│   │   └── dev.db        # Arquivo do banco SQLite
│   ├── requests/         # Arquivos de requisições HTTP
│   │   └── requisicoes.http  # Exemplos de requisições
│   └── scripts/          # Scripts utilitários
│       ├── apply-migration.js  # Aplicar migrações
│       └── check-db.js          # Verificar banco
├── .claude/              # Configurações Claude (local)
├── server.ts            # Servidor principal
├── CLAUDE.md            # Documentação Claude (local)
├── package.json         # Configurações e dependências
├── tsconfig.json        # Configuração TypeScript
├── drizzle.config.ts    # Configuração Drizzle Kit
└── README.md           # Este arquivo
```

> **Nota:** Os diretórios `docs/`, `.claude/` e o arquivo `CLAUDE.md` são locais e não são versionados no Git.

## Modelos de Dados
### Course
```typescript
interface Course {
  id: number           // ID único (auto-incremento)
  title: string        // Título do curso
  description: string   // Descrição do curso (opcional)
  created_at: Date     // Data de criação
  updated_at: Date     // Data de atualização
}
```

## Scripts Disponíveis
- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload (mata processos existentes automaticamente)
- `npm run dev:clean` - Versão mais robusta que aguarda mais tempo antes de reiniciar
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Executa o servidor TypeScript diretamente
- `npm run start:prod` - Executa a versão compilada em produção
- `npm run migrate` - Aplica migrações do banco SQLite
- `npm run migrate:generate` - Gera novas migrações baseadas no schema
- `npm run db:setup` - Configura o banco de dados (gera e aplica migrações)
- `npm run db:reset` - Reseta o banco SQLite
- `npm run db:check` - Verifica o status do banco SQLite
- `npm run drizzle:studio` - Abre interface gráfica do Drizzle Studio

## Testando a API
O projeto inclui um arquivo `src/requests/requisicoes.http` com exemplos de requisições que podem ser usados com extensões como REST Client no VS Code.

### Exemplos de uso:
```http
# Criar um novo curso
POST http://localhost:3333/courses
Content-Type: application/json

{
  "title": "Curso de TypeScript"
}

# Criar múltiplos cursos
POST http://localhost:3333/courses
Content-Type: application/json

[
  { "title": "TypeScript" },
  { "title": "Docker" },
  { "title": "PostgreSQL" },
  { "title": "Next.js" },
  { "title": "Go" }
]

# Listar todos os cursos
GET http://localhost:3333/courses

# Buscar curso específico
GET http://localhost:3333/courses/1
```

## Características Técnicas
- **Tipagem**: TypeScript com interfaces bem definidas
- **Validação**: Validação básica de entrada nos endpoints
- **Logging**: Sistema de logs configurado com pino-pretty
- **Banco de Dados**: SQLite com Drizzle ORM para desenvolvimento
- **Migrações**: Sistema de migrações automáticas
- **Error Handling**: Tratamento de erros com códigos HTTP apropriados

## Documentação Técnica

Para informações detalhadas sobre configuração e uso:

- **[docs/README.md](./docs/README.md)** - Visão geral da documentação
- **[docs/instrucoes.md](./docs/instrucoes.md)** - Instruções completas de setup
- **[docs/migracoes-drizzle.md](./docs/migracoes-drizzle.md)** - Guia completo de migrações
- **[docs/drizzle-studio-setup.md](./docs/drizzle-studio-setup.md)** - Configuração do Drizzle Studio

## Dicas de Desenvolvimento
- Use `npm run dev` durante o desenvolvimento para ter hot reload
- O servidor reinicia automaticamente quando arquivos são modificados
- Logs são formatados de forma legível durante o desenvolvimento
- Todos os endpoints retornam JSON
- Consulte a documentação técnica na pasta `docs/` para informações detalhadas

## Licença
ISC

---

**Projeto de Estudo** - Desenvolvido para fins educacionais e aprendizado de Node.js com TypeScript e Fastify.
