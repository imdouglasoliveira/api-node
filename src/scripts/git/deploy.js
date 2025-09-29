#!/usr/bin/env node

/**
 * Script de Deploy Automatizado
 * 
 * Este script automatiza o fluxo de deploy:
 * 1. Commit e push na branch dev
 * 2. Merge dev → beta
 * 3. Merge beta → main
 * 4. Retorna para a branch dev
 * 
 * Uso: node src/scripts/git/deploy.js [mensagem-do-commit]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
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
        log(`\n🔄 ${description}...`, 'blue');
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

function main() {
    log('🚀 Iniciando deploy automatizado...', 'bright');
    
    // Verificar se estamos na branch dev
    const currentBranch = getCurrentBranch();
    if (currentBranch !== 'dev') {
        log(`⚠️  Você está na branch '${currentBranch}', mas o deploy deve ser feito a partir da branch 'dev'`, 'yellow');
        log('💡 Execute: git checkout dev', 'cyan');
        process.exit(1);
    }
    
    // Verificar se há alterações para commit
    const gitStatus = checkGitStatus();
    if (!gitStatus) {
        log('ℹ️  Nenhuma alteração para commit', 'yellow');
        log('💡 Faça suas alterações e tente novamente', 'cyan');
        process.exit(0);
    }
    
    // Obter mensagem do commit
    const commitMessage = process.argv[2] || 'feat: deploy automático';
    
    log(`\n📋 Resumo do deploy:`, 'bright');
    log(`   Branch atual: ${currentBranch}`, 'cyan');
    log(`   Mensagem do commit: ${commitMessage}`, 'cyan');
    log(`   Alterações: ${gitStatus.split('\n').length} arquivo(s)`, 'cyan');
    
    // 1. Commit e push na branch dev
    execCommand('git add .', 'Adicionando arquivos ao staging');
    execCommand(`git commit -m "${commitMessage}"`, 'Fazendo commit na branch dev');
    execCommand('git push origin dev', 'Fazendo push para origin/dev');
    
    // 2. Merge dev → beta
    execCommand('git checkout beta', 'Mudando para branch beta');
    execCommand('git merge dev', 'Fazendo merge dev → beta');
    execCommand('git push origin beta', 'Fazendo push para origin/beta');
    
    // 3. Merge beta → main
    execCommand('git checkout main', 'Mudando para branch main');
    execCommand('git merge beta', 'Fazendo merge beta → main');
    execCommand('git push origin main', 'Fazendo push para origin/main');
    
    // 4. Retornar para dev
    execCommand('git checkout dev', 'Retornando para branch dev');
    
    log('\n🎉 Deploy concluído com sucesso!', 'green');
    log('\n📊 Resumo:', 'bright');
    log('   ✅ Commit e push na branch dev', 'green');
    log('   ✅ Merge dev → beta', 'green');
    log('   ✅ Merge beta → main', 'green');
    log('   ✅ Retorno para branch dev', 'green');
    
    log('\n🔗 Links úteis:', 'bright');
    log('   GitHub: https://github.com/imdouglasoliveira/api-node', 'cyan');
    log('   Branch dev: https://github.com/imdouglasoliveira/api-node/tree/dev', 'cyan');
    log('   Branch beta: https://github.com/imdouglasoliveira/api-node/tree/beta', 'cyan');
    log('   Branch main: https://github.com/imdouglasoliveira/api-node/tree/main', 'cyan');
}

// Executar sempre
main();

export { main as deploy };
