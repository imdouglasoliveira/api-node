#!/usr/bin/env node

/**
 * Script Principal do Banco de Dados
 * 
 * Este script é o ponto de entrada para todos os comandos de banco de dados.
 * 
 * Uso: node src/scripts/database/index.js [comando] [opções]
 * 
 * Comandos disponíveis:
 * - migrate - Aplicar migrações
 * - check - Verificar status do banco
 * - help - Mostra esta ajuda
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
    try {
        log(`🔄 ${description}...`, 'blue');
        const output = execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            cwd: process.cwd()
        });
        log(`✅ ${description} concluído!`, 'green');
        return output;
    } catch (error) {
        log(`❌ Erro ao executar: ${description}`, 'red');
        log(`Comando: ${command}`, 'yellow');
        log(`Erro: ${error.message}`, 'red');
        process.exit(1);
    }
}

function showHelp() {
    log('🗄️  Scripts de Banco de Dados - API Node.js', 'bright');
    log('=' .repeat(50), 'cyan');
    
    log('\n📋 Comandos disponíveis:', 'green');
    log('   migrate - Aplicar migrações do banco', 'cyan');
    log('   seed-users [quantidade] - Popular o banco com usuários (padrão 2)', 'cyan');
    log('   seed-courses [limite] - Popular o banco com cursos (limite opcional)', 'cyan');
    log('   check   - Verificar status do banco', 'cyan');
    log('   help    - Mostra esta ajuda', 'cyan');
    
    log('\n💡 Exemplos de uso:', 'yellow');
    log('   npm run db:migrate', 'cyan');
    log('   npm run db:seed', 'cyan');
    log('   npm run db:seed 5', 'cyan');
    log('   npm run db:seed-courses', 'cyan');
    log('   npm run db:seed-courses 10', 'cyan');
    log('   npm run db:check', 'cyan');
    
    log('\n🔗 Scripts npm disponíveis:', 'green');
    log('   npm run db:migrate      - Aplicar migrações', 'cyan');
    log('   npm run db:seed         - Popular usuários', 'cyan');
    log('   npm run db:seed-courses - Popular cursos', 'cyan');
    log('   npm run db:check        - Verificar status', 'cyan');
    log('   npm run db:setup        - Configuração inicial', 'cyan');
    log('   npm run db:reset        - Reset do banco', 'cyan');
    
    log('\n📚 Documentação:', 'green');
    log('   docs/migracoes-drizzle.md - Guia de migrações', 'cyan');
    log('   docs/drizzle-studio-setup.md - Configuração do Studio', 'cyan');
}

function migrate() {
    log('🗄️  Aplicando migrações do banco...', 'bright');
    execCommand('node src/scripts/database/apply-migration.js', 'Aplicando migrações');
}

function check() {
    log('🔍 Verificando status do banco...', 'bright');
    execCommand('node src/scripts/database/check-db.js', 'Verificando status');
}

function seedUsers() {
    log('🌱 Populando banco com usuários...', 'bright');
    const quantity = process.argv[3] ? parseInt(process.argv[3]) : undefined;
    execCommand(`tsx src/database/seed-users.ts ${quantity !== undefined ? quantity : ''}`, 'Populando usuários');
}

function seedCourses() {
    log('🌱 Populando banco com cursos...', 'bright');
    const limit = process.argv[3] ? parseInt(process.argv[3]) : undefined;
    execCommand(`tsx src/database/seed-courses.ts ${limit !== undefined ? limit : ''}`, 'Populando cursos');
}

function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            migrate();
            break;
            
        case 'check':
            check();
            break;

        case 'seed-users':
            seedUsers();
            break;
        
        case 'seed-courses':
            seedCourses();
            break;
            
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
            
        default:
            if (!command) {
                log('❌ Nenhum comando especificado', 'red');
            } else {
                log(`❌ Comando desconhecido: ${command}`, 'red');
            }
            log('\n💡 Use "npm run db:help" para ver os comandos disponíveis', 'yellow');
            showHelp();
            process.exit(1);
    }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
    main();
}

export { main, migrate, check, seedUsers, seedCourses };
