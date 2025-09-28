import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Função para aplicar migrações SQLite
function applyMigration(migrationFile) {
    console.log(`📦 Aplicando migração: ${migrationFile}`);
    
    try {
        // Ler arquivo de migração
        const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
        
        // Conectar ao banco SQLite
        const sqlite = new Database('./src/database/dev.db');
        const db = drizzle(sqlite);
        
        // Executar migração
        sqlite.exec(migrationSQL);
        
        console.log('✅ Migração aplicada com sucesso!');
        
        sqlite.close();
        
    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error.message);
        process.exit(1);
    }
}

// Função principal
function main() {
    const drizzleDir = './drizzle';
    
    if (!fs.existsSync(drizzleDir)) {
        console.error('❌ Diretório drizzle não encontrado');
        process.exit(1);
    }
    
    // Listar arquivos de migração
    const migrationFiles = fs.readdirSync(drizzleDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    
    if (migrationFiles.length === 0) {
        console.log('ℹ️  Nenhuma migração encontrada');
        return;
    }
    
    console.log(`📋 Migrações encontradas: ${migrationFiles.length}`);
    
    // Aplicar cada migração
    migrationFiles.forEach(file => {
        const fullPath = path.join(drizzleDir, file);
        applyMigration(fullPath);
    });
    
    console.log('🎉 Todas as migrações foram aplicadas!');
}

// Executar se chamado diretamente
main();

export { applyMigration };
