# Documentação do Projeto API Node

Esta pasta contém toda a documentação técnica do projeto.

## 📋 Documentos Disponíveis

### [Instruções Gerais](./instrucoes.md)
- Configuração inicial do projeto
- Instalação de dependências
- Comandos básicos de desenvolvimento
- Configuração do SQLite
- Gerenciamento de versões Node.js

### [Guia de Migrações do Drizzle](./migracoes-drizzle.md)
- Sistema de migrações SQLite
- Comandos de migração
- Troubleshooting
- Configuração atual do banco

### [Drizzle Studio Setup](./drizzle-studio-setup.md)
- Configuração do Drizzle Studio
- Visualização do banco SQLite
- Interface gráfica para desenvolvimento

## 🚀 Início Rápido

1. **Configuração inicial:** Veja [instrucoes.md](./instrucoes.md)
2. **Migrações:** Veja [migracoes-drizzle.md](./migracoes-drizzle.md)
3. **Drizzle Studio:** Veja [drizzle-studio-setup.md](./drizzle-studio-setup.md)

## 📝 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev

# Migrações SQLite
npm run migrate:generate  # Gerar migração
npm run migrate          # Aplicar migração
npm run db:setup         # Gerar e aplicar migrações
npm run db:reset         # Resetar banco e aplicar migrações
npm run db:check         # Verificar status do banco

# Drizzle Studio
npm run drizzle:studio   # Abrir interface gráfica

# Testes
# Use o arquivo src/requests/requisicoes.http com REST Client
```

## ✅ Vantagens do SQLite

- **Simplicidade**: Sem necessidade de Docker
- **Performance**: Mais rápido para desenvolvimento
- **Compatibilidade**: Funciona perfeitamente no Windows
- **Portabilidade**: Arquivo único `dev.db`
- **Zero Configuração**: Funciona out-of-the-box

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação específica
2. Execute `npm run db:check` para verificar o banco
3. Execute `npm run db:reset` para resetar o banco
4. Consulte os logs do servidor

---

**Última atualização:** 28/09/2025
