# Desafio Node.js – Primeira API (aulas)

API simples em Node.js + TypeScript usando Fastify, Drizzle ORM (SQLite) e Zod. Inclui documentação Swagger/Scalar em ambiente de desenvolvimento.

## Requisitos
- Node.js 20.12.2+ (recomendado usar .nvmrc)
- npm (ou outro gerenciador, mas o projeto usa `package-lock.json`)

## Tecnologias
- **Fastify 5** - Framework web rápido e eficiente
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Drizzle ORM + SQLite** - ORM moderno e type-safe com banco embarcado
- **Zod** - Validação de dados
- **Swagger/OpenAPI + Scalar API Reference** (em `/docs` quando `NODE_ENV=development`)
- **Vitest + Supertest** - Testes E2E com 27 testes cobrindo todas as rotas
- **tsx** - Executor TypeScript para desenvolvimento
- **pino-pretty** - Logger formatado para desenvolvimento

## Configuração
1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo `.env` na raiz com:
```bash
# Ativa docs em /docs
NODE_ENV=development
```
4. Configure o banco de dados SQLite:
```bash
# Opção 1: Setup completo (gerar + aplicar migrações)
npm run db:setup

# Opção 2: Passo a passo
npm run migrate:generate  # Gera arquivo SQL de migração
npm run migrate          # Aplica migrações no banco
```

5. (Opcional) Popular banco de dados com dados de exemplo:
```bash
# Seed completo (usuários + cursos + matrículas)
# Padrão: 5 usuários, 20 cursos, 3 matrículas por usuário
npm run db:seed

# Seed completo com quantidades customizadas
npm run db:seed -- --users=10 --courses=8 --enrollments=4

# Seeds individuais (caso prefira popular separadamente)
npm run db:seed-users       # Padrão: 2 usuários
npm run db:seed-users 10    # Criar 10 usuários
npm run db:seed-courses     # Padrão: todos os 20 cursos
npm run db:seed-courses 5   # Criar apenas 5 cursos
```

6. (Opcional) Para inspecionar o schema/estado com o Drizzle Studio:
```bash
npm run drizzle:studio
```

## Executando o servidor
```bash
npm run dev
```
- Porta padrão: `http://localhost:3333`
- Logs legíveis habilitados
- Documentação da API (em dev): `http://localhost:3333/docs`

## Endpoints
Base URL: `http://localhost:3333`

### Courses (Cursos)
- **POST `/courses`**
  - Cria um curso único ou múltiplos cursos
  - Body (JSON):
    ```json
    { "title": "Curso de Docker", "description": "Aprenda Docker" }
    ```
    ou array para múltiplos:
    ```json
    [
      { "title": "Curso A", "description": "Desc A" },
      { "title": "Curso B" }
    ]
    ```
  - Respostas: 201 (sucesso), 500 (erro)

- **GET `/courses`**
  - Lista todos os cursos com paginação, busca e ordenação
  - Query params: `page`, `limit`, `search`, `orderBy`
  - 200: `{ "courses": [...], "currentPage": 1, "perPage": 10, "totalItems": 20, "totalPages": 2 }`

- **GET `/courses/:id`**
  - Busca um curso pelo ID
  - Respostas: 200 (encontrado), 404 (não encontrado)

### Users (Usuários)
- **POST `/users`**
  - Cria um usuário único ou múltiplos usuários
  - Body (JSON):
    ```json
    { "first_name": "João", "last_name": "Silva", "email": "joao@email.com" }
    ```
    ou array para múltiplos usuários
  - Respostas: 201 (sucesso), 500 (erro)

- **GET `/users`**
  - Lista todos os usuários com paginação, busca e ordenação
  - Query params: `page`, `limit`, `search`, `orderBy`
  - 200: `{ "users": [...], "currentPage": 1, "perPage": 10, "totalItems": 5, "totalPages": 1 }`

- **GET `/users/:id`**
  - Busca um usuário pelo ID
  - Respostas: 200 (encontrado), 404 (não encontrado)

### Enrollments (Matrículas)
- **POST `/enrollments`**
  - Cria uma matrícula única ou múltiplas matrículas
  - Body (JSON):
    ```json
    { "user_id": 1, "course_id": 1 }
    ```
    ou array para múltiplas matrículas
  - Respostas: 201 (sucesso), 500 (erro)

- **GET `/enrollments`**
  - Lista todas as matrículas com paginação e filtros
  - Query params: `page`, `limit`, `user_id`, `course_id`
  - 200: `{ "enrollments": [...], "currentPage": 1, "perPage": 10, "totalItems": 15, "totalPages": 2 }`
  - Retorna dados enriquecidos com nome do usuário e título do curso

- **GET `/enrollments/:user_id/:course_id`**
  - Busca uma matrícula específica por user_id e course_id
  - Respostas: 200 (encontrado), 404 (não encontrado)

Há arquivos `.http` na pasta `src/requests/` com exemplos prontos (compatível com extensões de REST Client):
- `src/requests/courses/courses.http` - Requisições de cursos
- `src/requests/users/users.http` - Requisições de usuários
- `src/requests/enrollments/enrollments.http` - Requisições de matrículas

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
│   │   ├── dev.db        # Arquivo do banco SQLite
│   │   └── seeds/        # Scripts para popular o banco
│   │       ├── index.ts           # Seed completo (users + courses + enrollments)
│   │       ├── seed-users.ts      # Seed apenas de usuários
│   │       └── seed-courses.ts    # Seed apenas de cursos
│   ├── requests/         # Arquivos de requisições HTTP (REST Client)
│   │   ├── courses/
│   │   │   └── courses.http      # Exemplos de requisições de cursos
│   │   ├── users/
│   │   │   └── users.http        # Exemplos de requisições de usuários
│   │   └── enrollments/
│   │       └── enrollments.http  # Exemplos de requisições de matrículas
│   ├── routes/           # Rotas da API
│   │   ├── courses/      # Rotas de cursos (get, create, get-by-id)
│   │   │   └── __tests__ # Testes E2E (11 testes)
│   │   ├── users/        # Rotas de usuários (get, create, get-by-id)
│   │   │   └── __tests__ # Testes E2E (11 testes)
│   │   └── enrollments/  # Rotas de matrículas (get, create, get-by-ids)
│   │       └── __tests__ # Testes E2E (11 testes)
│   ├── tests/            # Utilitários de teste
│   │   ├── factories/    # Factories para criar dados de teste
│   │   │   ├── make-course.ts
│   │   │   ├── make-user.ts
│   │   │   └── make-enrollment.ts
│   │   └── utils/        # Mocks e helpers de teste
│   │       ├── mocks/    # Geradores de dados fake
│   │       └── database.ts # Utilitário cleanDatabase
│   └── scripts/          # Scripts utilitários
│       ├── database/     # Scripts de gerenciamento do banco
│       │   ├── index.js          # Exportações
│       │   ├── apply-migration.js # Aplicar migrações
│       │   ├── check-db.js       # Verificar status do banco
│       │   └── reset-table.js    # Resetar tabelas específicas
│       ├── git/          # Scripts de automação Git
│       │   ├── index.js          # Exportações
│       │   ├── cleanup.js        # Limpar processos
│       │   ├── deploy.js         # Deploy automatizado
│       │   ├── push-dev.js       # Push para dev
│       │   └── status.js         # Git status formatado
│       └── README.md     # Documentação dos scripts
├── .claude/              # Configurações Claude (local)
├── server.ts            # Servidor principal
├── CLAUDE.md            # Documentação Claude (local)
├── package.json         # Configurações e dependências
├── tsconfig.json        # Configuração TypeScript
├── drizzle.config.ts    # Configuração Drizzle Kit
└── README.md           # Este arquivo
```

> **Nota:** Os diretórios `docs/`, `.claude/` e o arquivo `CLAUDE.md` são locais e não são versionados no Git.

## Modelos (schema)
Tabelas principais definidas em `src/database/schema.ts`:
- **`courses`**
  - `id` (integer, pk, auto-increment)
  - `title` (text, único, obrigatório)
  - `description` (text, opcional)
  - `created_at` (timestamp, obrigatório)
  - `updated_at` (timestamp, obrigatório)
- **`users`**
  - `id` (integer, pk, auto-increment)
  - `first_name` (text, obrigatório)
  - `last_name` (text, obrigatório)
  - `email` (text, único, obrigatório)
  - `created_at` (timestamp, obrigatório)
  - `updated_at` (timestamp, obrigatório)
- **`enrollments`**
  - `user_id` (integer, fk → users.id, obrigatório)
  - `course_id` (integer, fk → courses.id, obrigatório)
  - `created_at` (timestamp, obrigatório)
  - `updated_at` (timestamp, obrigatório)

## Scripts

### Desenvolvimento
- `npm run dev`: inicia o servidor com reload e carrega variáveis de `.env`
- `npm run drizzle:studio`: abre o Drizzle Studio

### Testes
- `npm test`: executa todos os 27 testes E2E
- `npm run test:watch`: executa testes em modo watch
- `npm run test:ui`: abre interface gráfica do Vitest
- `npm run test:coverage`: gera relatório de cobertura de código
  - Relatório no terminal + HTML em `coverage/index.html`
  - Métricas: linhas, funções, branches, statements
  - Exclui: tests, scripts, configs

### Migrações
- `npm run migrate:generate`: gera artefatos do Drizzle a partir do schema
- `npm run migrate`: aplica migrações no banco
- `npm run db:setup`: configura o banco de dados (gera e aplica migrações)
- `npm run db:reset`: **DELETA** o banco SQLite e recria do zero
- `npm run db:check`: verifica o status do banco SQLite

### Seeds (Popular dados)
- `npm run db:seed`: executa seed completo (usuários + cursos + matrículas)
  - Padrão: 5 usuários, 20 cursos, 3 matrículas/usuário
  - Com parâmetros: `npm run db:seed -- --users=10 --courses=8 --enrollments=4`
  - **Algoritmo de matrículas**: Cada usuário é matriculado em N cursos **aleatórios** sem repetição
    - Exemplo: 3 usuários, 5 cursos, 2 matrículas/usuário = 6 matrículas totais
    - User 1 → sorteados: Course A, Course D
    - User 2 → sorteados: Course B, Course E
    - User 3 → sorteados: Course C, Course A
- `npm run db:seed-users [quantidade]`: cria apenas usuários (padrão: 2)
- `npm run db:seed-courses [limite]`: cria apenas cursos (padrão: todos os 20)

### Resetar Tabelas (limpa dados, mantém estrutura, reseta IDs)
> **Importante:** Estes comandos **apagam todos os registros** da tabela e **resetam os IDs autoincrementais para 1**.

- `npm run db:reset-table [nome]`: reseta tabela específica (users, courses ou enrollments)
- `npm run db:reset-users`: limpa apenas a tabela `users`
- `npm run db:reset-courses`: limpa apenas a tabela `courses`
- `npm run db:reset-enrollments`: limpa apenas a tabela `enrollments`
- `npm run db:reset-all-tables`: limpa TODAS as tabelas (mantém estrutura do banco)

**Exemplo de uso:**
```bash
# Cenário: Você tem cursos com IDs 5, 6, 7 e quer recomeçar do ID 1
npm run db:reset-courses    # Limpa tabela courses
npm run db:seed-courses 3   # Cria 3 cursos com IDs 1, 2, 3
```

## Fluxo principal (Mermaid)

```mermaid
sequenceDiagram
  participant C as Client
  participant S as Fastify Server
  participant V as Zod Validator
  participant DB as Drizzle + SQLite

  C->>S: POST /courses {title}
  S->>V: Validar body
  V-->>S: OK ou Erro 400
  alt válido
    S->>DB: INSERT INTO courses (title)
    DB-->>S: {id}
    S-->>C: 201 {courseId}
  else inválido
    S-->>C: 400
  end

  C->>S: GET /courses
  S->>DB: SELECT id,title FROM courses
  DB-->>S: lista
  S-->>C: 200 {result: [...]} 

  C->>S: GET /courses/:id
  S->>V: Validar param id (number)
  V-->>S: OK ou Erro 400
  alt encontrado
    S->>DB: SELECT * FROM courses WHERE id=...
    DB-->>S: course
    S-->>C: 200 {course}
  else não encontrado
    S-->>C: 404
  end
```

## Testes E2E

### Estrutura dos Testes
O projeto possui 27 testes E2E organizados por recurso:
- **Courses**: 11 testes (paginação, busca, validação, timestamps)
- **Users**: 11 testes (paginação, busca, validação, email único)
- **Enrollments**: 11 testes (filtros, joins, foreign keys)

### Padrão de Testes
```typescript
// Usando factories (recomendado para testes by-id)
const course = await makeCourse()
const user = await makeUser({ email: "custom@email.com" })
const enrollment = await makeEnrollment({ user_id: user.id, course_id: course.id })

// Usando mocks (quando não precisa inserir no banco)
const mockCourse = generateCourseMock()
await db.insert(courses).values(mockCourse)
```

### Isolamento de Testes
Cada teste é isolado com:
- `beforeEach(() => cleanDatabase())` - Limpa todas as tabelas
- `beforeAll()` - Inicia servidor único
- `afterAll()` - Fecha servidor

### Executar Testes
```bash
# Todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Interface gráfica
npm run test:ui

# Cobertura de código
npm run test:coverage
```

### Relatório de Coverage
O comando `npm run test:coverage` gera:

**Terminal:**
```
 % Coverage report from v8
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   85.5  |   75.0   |   90.0  |   85.5  |
 routes/courses           |   95.0  |   87.5   |  100.0  |   95.0  |
 routes/users             |   80.0  |   65.0   |   85.0  |   80.0  |
...
```

**HTML:** Abra `coverage/index.html` no navegador para relatório visual interativo
- 🟢 Verde: Código testado
- 🔴 Vermelho: Código não testado
- 🟡 Amarelo: Código parcialmente testado

## Dicas e solução de problemas

### Problema: Banco de dados não criado ou vazio
**Solução:**
```bash
# 1. Verificar status do banco
npm run db:check

# 2. Se o banco estiver vazio ou corrompido, execute:
npm run db:reset

# 3. Popular com dados de exemplo
npm run db:seed -- --users=5 --courses=10 --enrollments=3
```

### Problema: Migrações ausentes (pasta drizzle/ vazia)
**Solução:**
```bash
# 1. Regenerar migrações
npm run migrate:generate

# 2. Aplicar migrações
npm run migrate

# 3. Verificar se funcionou
npm run db:check
```

### Problema: Preciso limpar dados de teste mas manter a estrutura
**Solução:**
```bash
# Resetar uma tabela específica (apaga dados e reseta IDs)
npm run db:reset-courses
npm run db:reset-users

# Resetar TODAS as tabelas (mantém estrutura do banco)
npm run db:reset-all-tables

# Popular novamente com dados limpos
npm run db:seed -- --users=5 --courses=10 --enrollments=3
```

### Diferença entre comandos de reset
- **`npm run db:reset`**: DELETA o arquivo do banco e recria tudo do zero (estrutura + dados)
- **`npm run db:reset-table [nome]`**: Limpa apenas UMA tabela, mantém estrutura e reseta IDs para começar do 1
- **`npm run db:reset-all-tables`**: Limpa TODAS as tabelas, mas mantém a estrutura do banco

### Outros problemas comuns
- **Arquivo SQLite não encontrado**: confirme que `npm run db:setup` foi executado e que o arquivo `src/database/dev.db` existe.
- **Variável `NODE_ENV` ausente**: verifique seu `.env`. A documentação em `/docs` só aparece quando `NODE_ENV=development`.
- **Docs não aparecem em `/docs`**: garanta `NODE_ENV=development` no `.env` e reinicie o servidor.
- **Banco corrompido**: execute `npm run db:reset` para resetar o banco SQLite.
- **Erro ao popular dados**: certifique-se de que as migrações foram aplicadas antes de rodar os seeds.

## Licença
ISC (ver `package.json`).
