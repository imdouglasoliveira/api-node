# API Node.js - Projeto de Estudo

API simples em Node.js + TypeScript usando Fastify para gerenciamento de cursos. Projeto desenvolvido para fins de estudo e aprendizado.

## Requisitos
- Node.js 22+
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
  "courses": [
    { "id": "1", "name": "Curso de Node.js" },
    { "id": "2", "name": "Curso de React" }
  ],
  "page": 1,
  "total": 10
}
```

### GET `/courses/:id`
Busca um curso específico pelo ID.

**Parâmetros:**
- `id` (string) - ID do curso

**Respostas:**
- **200**: `{ "course": { "id": "1", "name": "Curso de Node.js" } }`
- **404**: `{ "error": "Curso não encontrado" }`

### POST `/courses`
Cria um novo curso.

**Body (JSON):**
```json
{
  "title": "Nome do Curso"
}
```

**Respostas:**
- **201**: `{ "id": "<uuid>", "name": "Nome do Curso" }`
- **400**: `{ "error": "Nome do curso é obrigatório" }`

## Estrutura do Projeto
```
api-node/
├── docs/                 # Documentação do projeto
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
├── server.ts            # Servidor principal
├── package.json         # Configurações e dependências
├── tsconfig.json        # Configuração TypeScript
├── drizzle.config.ts    # Configuração Drizzle Kit
└── README.md           # Este arquivo
```

## Modelos de Dados
### Course
```typescript
interface Course {
  id: string    // UUID único
  name: string  // Nome do curso
}
```

## Scripts Disponíveis
- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
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

## Dicas de Desenvolvimento
- Use `npm run dev` durante o desenvolvimento para ter hot reload
- O servidor reinicia automaticamente quando arquivos são modificados
- Logs são formatados de forma legível durante o desenvolvimento
- Todos os endpoints retornam JSON

## Licença
ISC

---

**Projeto de Estudo** - Desenvolvido para fins educacionais e aprendizado de Node.js com TypeScript e Fastify.
