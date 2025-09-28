import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Função para aplicar migrações via Docker
function applyMigration(migrationFile) {
    console.log(`📦 Aplicando migração: ${migrationFile}`);
    
    try {
        // Copiar arquivo para o container
        execSync(`docker cp ${migrationFile} api-node-db-1:/tmp/migration.sql`);
        
        // Executar migração
        const result = execSync('docker exec api-node-db-1 psql -U postgres -d api_node -f /tmp/migration.sql', {
            encoding: 'utf8'
        });
        
        console.log('✅ Migração aplicada com sucesso!');
        console.log(result);
        
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
