# Documentação do Projeto API Node

Esta pasta contém toda a documentação técnica do projeto.

## 📋 Documentos Disponíveis

### [Instruções Gerais](./instrucoes.md)
- Configuração inicial do projeto
- Instalação de dependências
- Comandos básicos de desenvolvimento
- Configuração do Docker
- Gerenciamento de versões Node.js

### [Guia de Migrações do Drizzle](./migracoes-drizzle.md)
- **⚠️ LEIA PRIMEIRO** - Problema com migrações no Windows
- Solução implementada para migrações
- Comandos alternativos
- Troubleshooting
- Configuração atual do banco

## 🚀 Início Rápido

1. **Configuração inicial:** Veja [instrucoes.md](./instrucoes.md)
2. **Problemas com migrações:** Veja [migracoes-drizzle.md](./migracoes-drizzle.md)

## 📝 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev

# Migrações
npm run migrate:generate  # Gerar migração
npm run migrate          # Aplicar migração
npm run db:setup         # Gerar e aplicar migrações
npm run db:reset         # Reiniciar banco e aplicar migrações
npm run db:check         # Verificar status do banco

# Docker
docker compose up -d     # Iniciar banco
docker compose down      # Parar banco
```

## ⚠️ Problemas Conhecidos

- **Migrações do Drizzle:** Use `npm run migrate` em vez de `npx drizzle-kit migrate`
- **Conectividade Windows-Docker:** Solução implementada nos scripts NPM

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação específica
2. Execute os comandos de troubleshooting
3. Verifique se o Docker está rodando
4. Consulte os logs do container

---

**Última atualização:** 28/09/2025
