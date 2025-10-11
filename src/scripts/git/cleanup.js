#!/usr/bin/env node

/**
 * Git Cleanup Script
 *
 * This script cleans the Git repository:
 * - Remove orphaned local branches
 * - Clean untracked files
 * - Reset uncommitted changes (with confirmation)
 * - Clean Git cache
 *
 * Usage: node src/scripts/git/cleanup.js [--force]
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
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
        log(`✅ ${description} completed!`, 'green');
        return output;
    } catch (error) {
        log(`❌ Error executing: ${description}`, 'red');
        log(`Command: ${command}`, 'yellow');
        log(`Error: ${error.message}`, 'red');
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

    log('🧹 Git Repository Cleanup', 'bright');
    log('=' .repeat(50), 'cyan');

    // Check current branch
    const currentBranch = getCurrentBranch();
    log(`\n🌿 Current branch: ${currentBranch}`, 'green');

    // Check uncommitted changes
    const uncommittedChanges = getUncommittedChanges();
    if (uncommittedChanges) {
        log('\n⚠️  Uncommitted changes found:', 'yellow');
        uncommittedChanges.split('\n').forEach(change => {
            log(`   ${change}`, 'cyan');
        });

        if (!isForce) {
            const shouldReset = await askConfirmation('\n❓ Do you want to discard these changes? (y/N): ');
            if (shouldReset) {
                execCommandWithOutput('git reset --hard HEAD', 'Discarding uncommitted changes');
                execCommandWithOutput('git clean -fd', 'Removing untracked files');
            } else {
                log('⏭️  Skipping change cleanup', 'yellow');
            }
        } else {
            execCommandWithOutput('git reset --hard HEAD', 'Discarding uncommitted changes');
            execCommandWithOutput('git clean -fd', 'Removing untracked files');
        }
    }

    // Check untracked files
    const untrackedFiles = getUntrackedFiles();
    if (untrackedFiles) {
        log('\n📁 Untracked files found:', 'yellow');
        untrackedFiles.split('\n').forEach(file => {
            log(`   ${file}`, 'cyan');
        });

        if (!isForce) {
            const shouldClean = await askConfirmation('\n❓ Do you want to remove these files? (y/N): ');
            if (shouldClean) {
                execCommandWithOutput('git clean -fd', 'Removing untracked files');
            } else {
                log('⏭️  Skipping file cleanup', 'yellow');
            }
        } else {
            execCommandWithOutput('git clean -fd', 'Removing untracked files');
        }
    }

    // Clean Git cache
    log('\n🧹 Cleaning Git cache...', 'blue');
    execCommandWithOutput('git gc --prune=now', 'Running garbage collection');

    // Check orphaned local branches
    const localBranches = getLocalBranches();
    const remoteBranches = getRemoteBranches();

    if (localBranches && remoteBranches) {
        const localBranchList = localBranches.split('\n').filter(b => b && b !== currentBranch);
        const remoteBranchList = remoteBranches.split('\n').filter(b => b && !b.includes('HEAD'));

        const orphanBranches = localBranchList.filter(local =>
            !remoteBranchList.some(remote => remote === local)
        );

        if (orphanBranches.length > 0) {
            log('\n🌿 Orphaned local branches found:', 'yellow');
            orphanBranches.forEach(branch => {
                log(`   ${branch}`, 'cyan');
            });

            if (!isForce) {
                const shouldDelete = await askConfirmation('\n❓ Do you want to delete these branches? (y/N): ');
                if (shouldDelete) {
                    orphanBranches.forEach(branch => {
                        execCommandWithOutput(`git branch -D ${branch}`, `Deleting branch ${branch}`);
                    });
                } else {
                    log('⏭️  Skipping branch deletion', 'yellow');
                }
            } else {
                orphanBranches.forEach(branch => {
                    execCommandWithOutput(`git branch -D ${branch}`, `Deleting branch ${branch}`);
                });
            }
        }
    }

    // Final summary
    log('\n' + '=' .repeat(50), 'cyan');
    log('🎉 Cleanup completed!', 'green');

    // Final status
    const finalStatus = getUncommittedChanges();
    if (!finalStatus) {
        log('✅ Repository clean and organized', 'green');
    } else {
        log('⚠️  There are still pending changes', 'yellow');
    }

    log('\n💡 Tips:', 'bright');
    log('   - Use "npm run git:status" to check status', 'cyan');
    log('   - Use "npm run git:cleanup --force" for automatic cleanup', 'cyan');
    log('   - Use "npm run deploy" to deploy', 'cyan');
}

// Always execute
main();

export { main as cleanup };
