#!/usr/bin/env node

/**
 * Main Git Script
 *
 * This script is the entry point for all Git commands in the project.
 *
 * Usage: node src/scripts/git/index.js [command] [options]
 *
 * Available commands:
 * - deploy [message] - Automated deploy (dev → beta → main)
 * - status - Detailed repository status
 * - cleanup [--force] - Repository cleanup
 * - help - Show this help
 */

import { deploy } from './deploy.js';
import { status } from './status.js';
import { cleanup } from './cleanup.js';
import { pushDev } from './push-dev.js';

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

function showHelp() {
    log('🛠️  Git Scripts - API Node.js', 'bright');
    log('=' .repeat(50), 'cyan');

    log('\n📋 Available commands:', 'green');
    log('   deploy [message]  - Automated deploy (dev → beta → main)', 'cyan');
    log('   push-dev [message] - Push to dev branch', 'cyan');
    log('   status            - Detailed repository status', 'cyan');
    log('   cleanup [--force] - Repository cleanup', 'cyan');
    log('   help              - Show this help', 'cyan');

    log('\n💡 Usage examples:', 'yellow');
    log('   npm run git:deploy "feat: new feature"', 'cyan');
    log('   npm run git:push-dev "fix: bug fix"', 'cyan');
    log('   npm run git:status', 'cyan');
    log('   npm run git:cleanup', 'cyan');
    log('   npm run git:cleanup --force', 'cyan');

    log('\n🔗 Available npm scripts:', 'green');
    log('   npm run git:deploy  - Automated deploy', 'cyan');
    log('   npm run git:push-dev - Push to dev branch', 'cyan');
    log('   npm run git:status  - Repository status', 'cyan');
    log('   npm run git:cleanup - Repository cleanup', 'cyan');

    log('\n📚 Documentation:', 'green');
    log('   README.md - Main project documentation', 'cyan');
    log('   docs/ - Detailed technical documentation', 'cyan');
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
                log('❌ No command specified', 'red');
            } else {
                log(`❌ Unknown command: ${command}`, 'red');
            }
            log('\n💡 Use "npm run git:help" to see available commands', 'yellow');
            showHelp();
            process.exit(1);
    }
}

// Execute only if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
    main();
}

export { main, deploy, pushDev, status, cleanup };
