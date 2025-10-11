#!/usr/bin/env node

/**
 * Automated Deploy Script
 *
 * This script automates the deploy flow:
 * 1. Commit and push to dev branch
 * 2. Merge dev → beta
 * 3. Merge beta → main
 * 4. Return to dev branch
 *
 * Usage: node src/scripts/git/deploy.js [commit-message]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

function execCommand(command, description) {
    try {
        log(`\n🔄 ${description}...`, 'blue');
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
        process.exit(1);
    }
}

function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
        log('❌ Error getting current branch', 'red');
        process.exit(1);
    }
}

function checkGitStatus() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim();
    } catch (error) {
        log('❌ Error checking Git status', 'red');
        process.exit(1);
    }
}

function main() {
    log('🚀 Starting automated deploy...', 'bright');

    // Check if we are on dev branch
    const currentBranch = getCurrentBranch();
    if (currentBranch !== 'dev') {
        log(`⚠️  You are on branch '${currentBranch}', but deploy must be done from 'dev' branch`, 'yellow');
        log('💡 Run: git checkout dev', 'cyan');
        process.exit(1);
    }

    // Check if there are changes to commit
    const gitStatus = checkGitStatus();
    if (!gitStatus) {
        log('ℹ️  No changes to commit', 'yellow');
        log('💡 Make your changes and try again', 'cyan');
        process.exit(0);
    }

    // Get commit message
    const commitMessage = process.argv[2] || 'feat: automated deploy';

    log(`\n📋 Deploy summary:`, 'bright');
    log(`   Current branch: ${currentBranch}`, 'cyan');
    log(`   Commit message: ${commitMessage}`, 'cyan');
    log(`   Changes: ${gitStatus.split('\n').length} file(s)`, 'cyan');

    // 1. Commit and push to dev branch
    execCommand('git add .', 'Adding files to staging');
    execCommand(`git commit -m "${commitMessage}"`, 'Committing to dev branch');
    execCommand('git push origin dev', 'Pushing to origin/dev');

    // 2. Merge dev → beta
    execCommand('git checkout beta', 'Switching to beta branch');
    execCommand('git merge dev', 'Merging dev → beta');
    execCommand('git push origin beta', 'Pushing to origin/beta');

    // 3. Merge beta → main
    execCommand('git checkout main', 'Switching to main branch');
    execCommand('git merge beta', 'Merging beta → main');
    execCommand('git push origin main', 'Pushing to origin/main');

    // 4. Return to dev
    execCommand('git checkout dev', 'Returning to dev branch');

    log('\n🎉 Deploy completed successfully!', 'green');
    log('\n📊 Summary:', 'bright');
    log('   ✅ Commit and push to dev branch', 'green');
    log('   ✅ Merge dev → beta', 'green');
    log('   ✅ Merge beta → main', 'green');
    log('   ✅ Return to dev branch', 'green');

    log('\n🔗 Useful links:', 'bright');
    log('   GitHub: https://github.com/imdouglasoliveira/api-node', 'cyan');
    log('   Branch dev: https://github.com/imdouglasoliveira/api-node/tree/dev', 'cyan');
    log('   Branch beta: https://github.com/imdouglasoliveira/api-node/tree/beta', 'cyan');
    log('   Branch main: https://github.com/imdouglasoliveira/api-node/tree/main', 'cyan');
}

// Always execute
main();

export { main as deploy };
