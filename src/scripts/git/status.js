#!/usr/bin/env node

/**
 * Script de Status do Git
 * 
 * Este script mostra o status detalhado do repositório Git:
 * - Branch atual
 * - Status das alterações
 * - Últimos commits
 * - Status das branches remotas
 * 
 * Uso: node src/scripts/git/status.js
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

function execCommand(command) {
    try {
        return execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            cwd: process.cwd()
        }).trim();
    } catch (error) {
        return null;
    }
}

function getCurrentBranch() {
    return execCommand('git branch --show-current');
}

function getGitStatus() {
    return execCommand('git status --porcelain');
}

function getLastCommits(count = 5) {
    return execCommand(`git log --oneline -${count}`);
}

function getBranchStatus() {
    return execCommand('git branch -vv');
}

function getRemoteStatus() {
    return execCommand('git remote -v');
}

function getUncommittedChanges() {
    const status = getGitStatus();
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
    log('📊 Status do Repositório Git', 'bright');
    log('=' .repeat(50), 'cyan');
    
    // Branch atual
    const currentBranch = getCurrentBranch();
    log(`\n🌿 Branch atual: ${currentBranch}`, 'green');
    
    // Status das alterações
    const changes = getUncommittedChanges();
    if (changes.length > 0) {
        log('\n📝 Alterações não commitadas:', 'yellow');
        changes.forEach(change => {
            const status = formatFileStatus(change.status);
            log(`   ${change.status} ${change.file} (${status})`, 'cyan');
        });
    } else {
        log('\n✅ Nenhuma alteração pendente', 'green');
    }
    
    // Últimos commits
    const lastCommits = getLastCommits();
    if (lastCommits) {
        log('\n📋 Últimos commits:', 'blue');
        lastCommits.split('\n').forEach(commit => {
            log(`   ${commit}`, 'cyan');
        });
    }
    
    // Status das branches
    const branchStatus = getBranchStatus();
    if (branchStatus) {
        log('\n🌿 Branches:', 'magenta');
        branchStatus.split('\n').forEach(branch => {
            const isCurrent = branch.startsWith('*');
            const color = isCurrent ? 'green' : 'cyan';
            log(`   ${branch}`, color);
        });
    }
    
    // Status remoto
    const remoteStatus = getRemoteStatus();
    if (remoteStatus) {
        log('\n🌐 Remotos:', 'blue');
        remoteStatus.split('\n').forEach(remote => {
            log(`   ${remote}`, 'cyan');
        });
    }
    
    // Resumo
    log('\n' + '=' .repeat(50), 'cyan');
    log(`📊 Resumo:`, 'bright');
    log(`   Branch: ${currentBranch}`, 'cyan');
    log(`   Alterações: ${changes.length} arquivo(s)`, 'cyan');
    log(`   Status: ${changes.length > 0 ? 'Há alterações pendentes' : 'Tudo limpo'}`, 
         changes.length > 0 ? 'yellow' : 'green');
    
    if (changes.length > 0) {
        log('\n💡 Próximos passos:', 'bright');
        log('   1. git add . (adicionar arquivos)', 'cyan');
        log('   2. git commit -m "sua mensagem" (fazer commit)', 'cyan');
        log('   3. npm run deploy "sua mensagem" (deploy automático)', 'cyan');
    }
}

// Executar sempre
main();

export { main as status };
