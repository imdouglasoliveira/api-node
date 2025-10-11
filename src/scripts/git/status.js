#!/usr/bin/env node

/**
 * Git Status Script
 *
 * This script shows detailed status of the Git repository:
 * - Current branch
 * - Change status
 * - Last commits
 * - Remote branch status
 *
 * Usage: node src/scripts/git/status.js
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
    log('📊 Git Repository Status', 'bright');
    log('=' .repeat(50), 'cyan');

    // Current branch
    const currentBranch = getCurrentBranch();
    log(`\n🌿 Current branch: ${currentBranch}`, 'green');

    // Change status
    const changes = getUncommittedChanges();
    if (changes.length > 0) {
        log('\n📝 Uncommitted changes:', 'yellow');
        changes.forEach(change => {
            const status = formatFileStatus(change.status);
            log(`   ${change.status} ${change.file} (${status})`, 'cyan');
        });
    } else {
        log('\n✅ No pending changes', 'green');
    }

    // Last commits
    const lastCommits = getLastCommits();
    if (lastCommits) {
        log('\n📋 Last commits:', 'blue');
        lastCommits.split('\n').forEach(commit => {
            log(`   ${commit}`, 'cyan');
        });
    }

    // Branch status
    const branchStatus = getBranchStatus();
    if (branchStatus) {
        log('\n🌿 Branches:', 'magenta');
        branchStatus.split('\n').forEach(branch => {
            const isCurrent = branch.startsWith('*');
            const color = isCurrent ? 'green' : 'cyan';
            log(`   ${branch}`, color);
        });
    }

    // Remote status
    const remoteStatus = getRemoteStatus();
    if (remoteStatus) {
        log('\n🌐 Remotes:', 'blue');
        remoteStatus.split('\n').forEach(remote => {
            log(`   ${remote}`, 'cyan');
        });
    }

    // Summary
    log('\n' + '=' .repeat(50), 'cyan');
    log(`📊 Summary:`, 'bright');
    log(`   Branch: ${currentBranch}`, 'cyan');
    log(`   Changes: ${changes.length} file(s)`, 'cyan');
    log(`   Status: ${changes.length > 0 ? 'Pending changes' : 'All clean'}`,
         changes.length > 0 ? 'yellow' : 'green');

    if (changes.length > 0) {
        log('\n💡 Next steps:', 'bright');
        log('   1. git add . (add files)', 'cyan');
        log('   2. git commit -m "your message" (make commit)', 'cyan');
        log('   3. npm run deploy "your message" (automated deploy)', 'cyan');
    }
}

// Always execute
main();

export { main as status };
