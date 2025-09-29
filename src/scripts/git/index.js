#!/usr/bin/env node

/**
 * Script Principal do Git
 * 
 * Este script é o ponto de entrada para todos os comandos Git do projeto.
 * 
 * Uso: node src/scripts/git/index.js [comando] [opções]
 * 
 * Comandos disponíveis:
 * - deploy [mensagem] - Deploy automático (dev → beta → main)
 * - status - Status detalhado do repositório
 * - cleanup [--force] - Limpeza do repositório
 * - help - Mostra esta ajuda
 */

import { deploy } from './deploy.js';
import { status } from './status.js';
import { cleanup } from './cleanup.js';
import { pushDev } from './push-dev.js';

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

function showHelp() {
    log('🛠️  Scripts Git - API Node.js', 'bright');
    log('=' .repeat(50), 'cyan');
    
    log('\n📋 Comandos disponíveis:', 'green');
    log('   deploy [mensagem]  - Deploy automático (dev → beta → main)', 'cyan');
    log('   push-dev [mensagem] - Push para branch dev', 'cyan');
    log('   status            - Status detalhado do repositório', 'cyan');
    log('   cleanup [--force] - Limpeza do repositório', 'cyan');
    log('   help              - Mostra esta ajuda', 'cyan');
    
    log('\n💡 Exemplos de uso:', 'yellow');
    log('   npm run git:deploy "feat: nova funcionalidade"', 'cyan');
    log('   npm run git:push-dev "fix: correção de bug"', 'cyan');
    log('   npm run git:status', 'cyan');
    log('   npm run git:cleanup', 'cyan');
    log('   npm run git:cleanup --force', 'cyan');
    
    log('\n🔗 Scripts npm disponíveis:', 'green');
    log('   npm run git:deploy  - Deploy automático', 'cyan');
    log('   npm run git:push-dev - Push para branch dev', 'cyan');
    log('   npm run git:status  - Status do repositório', 'cyan');
    log('   npm run git:cleanup - Limpeza do repositório', 'cyan');
    
    log('\n📚 Documentação:', 'green');
    log('   README.md - Documentação principal do projeto', 'cyan');
    log('   docs/ - Documentação técnica detalhada', 'cyan');
}

function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    switch (command) {
        case 'deploy':
            deploy();
            break;
            
        case 'push-dev':
            pushDev();
            break;
            
        case 'status':
            status();
            break;
            
        case 'cleanup':
            cleanup();
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
            log('\n💡 Use "npm run git:help" para ver os comandos disponíveis', 'yellow');
            showHelp();
            process.exit(1);
    }
}

// Executar sempre
main();

export { main, deploy, pushDev, status, cleanup };
