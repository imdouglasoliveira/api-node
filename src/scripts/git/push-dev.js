#!/usr/bin/env node

/**
 * Script de Push para Branch Dev
 * 
 * Este script automatiza o envio de alterações para a branch dev:
 * 1. Verifica se há alterações para commit
 * 2. Adiciona todos os arquivos ao staging
 * 3. Faz commit com mensagem personalizada ou padrão
 * 4. Faz push para origin/dev
 * 
 * Uso: node src/scripts/git/push-dev.js [mensagem-do-commit]
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

function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
        log('❌ Erro ao obter branch atual', 'red');
        process.exit(1);
    }
}

function checkGitStatus() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim();
    } catch (error) {
        log('❌ Erro ao verificar status do Git', 'red');
        process.exit(1);
    }
}

function getUncommittedChanges() {
    const status = checkGitStatus();
    if (!status) return [];
    
    return status.split('\n').map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        return { status, file };
    });
}

function formatFileStatus(status) {
    const statusMap = {
        'M ': 'Modificado',
        'A ': 'Adicionado',
        'D ': 'Deletado',
        'R ': 'Renomeado',
        'C ': 'Copiado',
        'U ': 'Não mesclado',
        '??': 'Não rastreado',
        '!!': 'Ignorado'
    };
    
    return statusMap[status] || status;
}

function main() {
    log('📤 Enviando alterações para branch dev...', 'bright');
    
    // Verificar branch atual
    const currentBranch = getCurrentBranch();
    log(`\n🌿 Branch atual: ${currentBranch}`, 'green');
    
    // Verificar se há alterações para commit
    const changes = getUncommittedChanges();
    if (changes.length === 0) {
        log('\nℹ️  Nenhuma alteração para commit', 'yellow');
        log('💡 Faça suas alterações e tente novamente', 'cyan');
        process.exit(0);
    }
    
    // Mostrar alterações
    log('\n📝 Alterações encontradas:', 'yellow');
    changes.forEach(change => {
        const status = formatFileStatus(change.status);
        log(`   ${change.status} ${change.file} (${status})`, 'cyan');
    });
    
    // Obter mensagem do commit
    const commitMessage = process.argv[2] || 'feat: atualização automática';
    
    log(`\n📋 Resumo do push:`, 'bright');
    log(`   Branch atual: ${currentBranch}`, 'cyan');
    log(`   Mensagem do commit: ${commitMessage}`, 'cyan');
    log(`   Alterações: ${changes.length} arquivo(s)`, 'cyan');
    
    // 1. Adicionar arquivos ao staging
    execCommand('git add .', 'Adicionando arquivos ao staging');
    
    // 2. Fazer commit
    execCommand(`git commit -m "${commitMessage}"`, 'Fazendo commit');
    
    // 3. Fazer push para origin/dev
    execCommand('git push origin dev', 'Fazendo push para origin/dev');
    
    log('\n🎉 Push para dev concluído com sucesso!', 'green');
    log('\n📊 Resumo:', 'bright');
    log('   ✅ Arquivos adicionados ao staging', 'green');
    log('   ✅ Commit realizado', 'green');
    log('   ✅ Push para origin/dev', 'green');
    
    log('\n🔗 Links úteis:', 'bright');
    log('   GitHub dev: https://github.com/imdouglasoliveira/api-node/tree/dev', 'cyan');
    log('   Para fazer deploy completo: npm run deploy', 'cyan');
}

// Executar sempre
main();

export { main as pushDev };
