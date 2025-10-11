#!/usr/bin/env node

/**
 * Push to Dev Branch Script
 *
 * This script automates sending changes to the dev branch:
 * 1. Check if there are changes to commit
 * 2. Add all files to staging
 * 3. Commit with custom or default message
 * 4. Push to origin/dev
 *
 * Usage: node src/scripts/git/push-dev.js [commit-message]
 */

import { execSync } from 'child_process';
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
        'M ': 'Modified',
        'A ': 'Added',
        'D ': 'Deleted',
        'R ': 'Renamed',
        'C ': 'Copied',
        'U ': 'Unmerged',
        '??': 'Untracked',
        '!!': 'Ignored'
    };

    return statusMap[status] || status;
}

function main() {
    log('📤 Sending changes to dev branch...', 'bright');

    // Check current branch
    const currentBranch = getCurrentBranch();
    log(`\n🌿 Current branch: ${currentBranch}`, 'green');

    // Check if there are changes to commit
    const changes = getUncommittedChanges();
    if (changes.length === 0) {
        log('\nℹ️  No changes to commit', 'yellow');
        log('💡 Make your changes and try again', 'cyan');
        process.exit(0);
    }

    // Show changes
    log('\n📝 Changes found:', 'yellow');
    changes.forEach(change => {
        const status = formatFileStatus(change.status);
        log(`   ${change.status} ${change.file} (${status})`, 'cyan');
    });

    // Get commit message
    const commitMessage = process.argv[2] || 'feat: automatic update';

    log(`\n📋 Push summary:`, 'bright');
    log(`   Current branch: ${currentBranch}`, 'cyan');
    log(`   Commit message: ${commitMessage}`, 'cyan');
    log(`   Changes: ${changes.length} file(s)`, 'cyan');

    // 1. Add files to staging
    execCommand('git add .', 'Adding files to staging');

    // 2. Make commit
    execCommand(`git commit -m "${commitMessage}"`, 'Committing changes');

    // 3. Push to origin/dev
    execCommand('git push origin dev', 'Pushing to origin/dev');

    log('\n🎉 Push to dev completed successfully!', 'green');
    log('\n📊 Summary:', 'bright');
    log('   ✅ Files added to staging', 'green');
    log('   ✅ Commit made', 'green');
    log('   ✅ Pushed to origin/dev', 'green');

    log('\n🔗 Useful links:', 'bright');
    log('   GitHub dev: https://github.com/imdouglasoliveira/api-node/tree/dev', 'cyan');
    log('   To do full deploy: npm run deploy', 'cyan');
}

// Always execute
main();

export { main as pushDev };
