import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';

// Função para verificar status do banco SQLite
function checkDatabaseStatus() {
    console.log('🔍 Verificando status do banco SQLite...\n');
    
    try {
        // Verificar se o arquivo do banco existe
        console.log('📦 Verificando arquivo do banco...');
        if (!fs.existsSync('./src/database/dev.db')) {
            console.log('❌ Arquivo dev.db não encontrado');
            console.log('💡 Execute: npm run migrate');
            return false;
        }
        
        console.log('✅ Arquivo do banco encontrado\n');
        
        // Conectar ao banco SQLite
        console.log('🔌 Testando conexão com o banco...');
        const sqlite = new Database('./src/database/dev.db');
        const db = drizzle(sqlite);
        
        // Verificar versão do SQLite
        const version = sqlite.prepare('SELECT sqlite_version() as version').get();
        console.log(`✅ Conexão com SQLite funcionando (versão: ${version.version})\n`);
        
        // Listar tabelas
        console.log('📋 Tabelas no banco:');
        const tables = sqlite.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();
        
        if (tables.length === 0) {
            console.log('ℹ️  Nenhuma tabela encontrada');
        } else {
            tables.forEach(table => {
                console.log(`  - ${table.name}`);
            });
        }
        console.log();
        
        // Verificar migrações aplicadas
        console.log('📝 Migrações aplicadas:');
        try {
            const migrations = sqlite.prepare(`
                SELECT * FROM __drizzle_migrations 
                ORDER BY created_at
            `).all();
            
            if (migrations.length === 0) {
                console.log('ℹ️  Nenhuma migração encontrada');
            } else {
                migrations.forEach(migration => {
                    console.log(`  - ${migration.hash} (${migration.created_at})`);
                });
            }
        } catch (error) {
            console.log('ℹ️  Tabela de migrações não encontrada ou vazia');
        }
        
        sqlite.close();
        
        console.log('\n🎉 Banco SQLite está funcionando corretamente!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar banco de dados:', error.message);
        console.log('\n💡 Soluções possíveis:');
        console.log('1. Execute: npm run migrate');
        console.log('2. Verifique se o arquivo dev.db não está corrompido');
        console.log('3. Execute: npm run db:reset');
        return false;
    }
}

// Executar verificação
checkDatabaseStatus();
