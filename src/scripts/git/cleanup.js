#!/usr/bin/env node

/**
 * Script de Limpeza do Git
 * 
 * Este script limpa o repositório Git:
 * - Remove branches locais órfãs
 * - Limpa arquivos não rastreados
 * - Reseta alterações não commitadas (com confirmação)
 * - Limpa cache do Git
 * 
 * Uso: node src/scripts/git/cleanup.js [--force]
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

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

function execCommandWithOutput(command, description) {
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
        return null;
    }
}

function getCurrentBranch() {
    return execCommand('git branch --show-current');
}

function getUncommittedChanges() {
    return execCommand('git status --porcelain');
}

function getUntrackedFiles() {
    return execCommand('git ls-files --others --exclude-standard');
}

function getLocalBranches() {
    return execCommand('git branch --format="%(refname:short)"');
}

function getRemoteBranches() {
    return execCommand('git branch -r --format="%(refname:short)"');
}

function askConfirmation(question) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().startsWith('s') || answer.toLowerCase().startsWith('y'));
        });
    });
}

async function main() {
    const isForce = process.argv.includes('--force');
    
    log('🧹 Limpeza do Repositório Git', 'bright');
    log('=' .repeat(50), 'cyan');
    
    // Verificar branch atual
    const currentBranch = getCurrentBranch();
    log(`\n🌿 Branch atual: ${currentBranch}`, 'green');
    
    // Verificar alterações não commitadas
    const uncommittedChanges = getUncommittedChanges();
    if (uncommittedChanges) {
        log('\n⚠️  Alterações não commitadas encontradas:', 'yellow');
        uncommittedChanges.split('\n').forEach(change => {
            log(`   ${change}`, 'cyan');
        });
        
        if (!isForce) {
            const shouldReset = await askConfirmation('\n❓ Deseja descartar essas alterações? (s/N): ');
            if (shouldReset) {
                execCommandWithOutput('git reset --hard HEAD', 'Descartando alterações não commitadas');
                execCommandWithOutput('git clean -fd', 'Removendo arquivos não rastreados');
            } else {
                log('⏭️  Pulando limpeza de alterações', 'yellow');
            }
        } else {
            execCommandWithOutput('git reset --hard HEAD', 'Descartando alterações não commitadas');
            execCommandWithOutput('git clean -fd', 'Removendo arquivos não rastreados');
        }
    }
    
    // Verificar arquivos não rastreados
    const untrackedFiles = getUntrackedFiles();
    if (untrackedFiles) {
        log('\n📁 Arquivos não rastreados encontrados:', 'yellow');
        untrackedFiles.split('\n').forEach(file => {
            log(`   ${file}`, 'cyan');
        });
        
        if (!isForce) {
            const shouldClean = await askConfirmation('\n❓ Deseja remover esses arquivos? (s/N): ');
            if (shouldClean) {
                execCommandWithOutput('git clean -fd', 'Removendo arquivos não rastreados');
            } else {
                log('⏭️  Pulando limpeza de arquivos', 'yellow');
            }
        } else {
            execCommandWithOutput('git clean -fd', 'Removendo arquivos não rastreados');
        }
    }
    
    // Limpeza do cache do Git
    log('\n🧹 Limpando cache do Git...', 'blue');
    execCommandWithOutput('git gc --prune=now', 'Executando garbage collection');
    
    // Verificar branches locais órfãs
    const localBranches = getLocalBranches();
    const remoteBranches = getRemoteBranches();
    
    if (localBranches && remoteBranches) {
        const localBranchList = localBranches.split('\n').filter(b => b && b !== currentBranch);
        const remoteBranchList = remoteBranches.split('\n').filter(b => b && !b.includes('HEAD'));
        
        const orphanBranches = localBranchList.filter(local => 
            !remoteBranchList.some(remote => remote === local)
        );
        
        if (orphanBranches.length > 0) {
            log('\n🌿 Branches locais órfãs encontradas:', 'yellow');
            orphanBranches.forEach(branch => {
                log(`   ${branch}`, 'cyan');
            });
            
            if (!isForce) {
                const shouldDelete = await askConfirmation('\n❓ Deseja deletar essas branches? (s/N): ');
                if (shouldDelete) {
                    orphanBranches.forEach(branch => {
                        execCommandWithOutput(`git branch -D ${branch}`, `Deletando branch ${branch}`);
                    });
                } else {
                    log('⏭️  Pulando deleção de branches', 'yellow');
                }
            } else {
                orphanBranches.forEach(branch => {
                    execCommandWithOutput(`git branch -D ${branch}`, `Deletando branch ${branch}`);
                });
            }
        }
    }
    
    // Resumo final
    log('\n' + '=' .repeat(50), 'cyan');
    log('🎉 Limpeza concluída!', 'green');
    
    // Status final
    const finalStatus = getUncommittedChanges();
    if (!finalStatus) {
        log('✅ Repositório limpo e organizado', 'green');
    } else {
        log('⚠️  Ainda há alterações pendentes', 'yellow');
    }
    
    log('\n💡 Dicas:', 'bright');
    log('   - Use "npm run git:status" para verificar o status', 'cyan');
    log('   - Use "npm run git:cleanup --force" para limpeza automática', 'cyan');
    log('   - Use "npm run deploy" para fazer deploy', 'cyan');
}

// Executar sempre
main();

export { main as cleanup };
