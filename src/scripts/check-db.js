import { execSync } from 'child_process';

// Função para verificar status do banco
function checkDatabaseStatus() {
    console.log('🔍 Verificando status do banco de dados...\n');
    
    try {
        // Verificar se o container está rodando
        console.log('📦 Verificando container Docker...');
        const containerStatus = execSync('docker compose ps --format json', { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        const containers = JSON.parse(`[${containerStatus.trim().replace(/\n/g, ',')}]`);
        const dbContainer = containers.find(c => c.Service === 'db');
        
        if (!dbContainer || dbContainer.State !== 'running') {
            console.log('❌ Container do banco não está rodando');
            console.log('💡 Execute: docker compose up -d');
            return false;
        }
        
        console.log('✅ Container do banco está rodando\n');
        
        // Verificar conexão com o banco
        console.log('🔌 Testando conexão com o banco...');
        execSync('docker exec api-node-db-1 psql -U postgres -d api_node -c "SELECT version();"', {
            stdio: 'pipe'
        });
        console.log('✅ Conexão com o banco funcionando\n');
        
        // Listar tabelas
        console.log('📋 Tabelas no banco:');
        const tablesResult = execSync('docker exec api-node-db-1 psql -U postgres -d api_node -c "\\dt"', {
            encoding: 'utf8'
        });
        console.log(tablesResult);
        
        // Verificar migrações aplicadas
        console.log('📝 Migrações aplicadas:');
        try {
            const migrationsResult = execSync('docker exec api-node-db-1 psql -U postgres -d api_node -c "SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;"', {
                encoding: 'utf8'
            });
            console.log(migrationsResult);
        } catch (error) {
            console.log('ℹ️  Tabela de migrações não encontrada ou vazia');
        }
        
        console.log('🎉 Banco de dados está funcionando corretamente!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar banco de dados:', error.message);
        console.log('\n💡 Soluções possíveis:');
        console.log('1. Verifique se o Docker está rodando');
        console.log('2. Execute: docker compose up -d');
        console.log('3. Verifique se o container api-node-db-1 existe');
        return false;
    }
}

// Executar verificação
checkDatabaseStatus();
