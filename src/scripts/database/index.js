#!/usr/bin/env node

/**
 * Node.js Database API Main Script 
 * 
 * This script is the entry point for all database commands.
 * 
 * Usage: node src/scripts/database/index.js [command] [options]
 * 
 * Available commands:
 * - migrate - Applying migrations
 * - check - Checking status of the database
 * - help - Show this help
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

function showHelp() {
    log('🗄️  Database Scripts - API Node.js', 'bright');
    log('=' .repeat(50), 'cyan');

    log('\n📋 Available commands:', 'green');
    log('   migrate - Apply migrations to the database', 'cyan');
    log('   seed-users [quantity] - Populate the database with users (default 2)', 'cyan');
    log('   seed-courses [limit] - Populate the database with courses (optional limit)', 'cyan');
    log('   check   - Check database status', 'cyan');
    log('   help    - Show this help', 'cyan');

    log('\n💡 Usage examples:', 'yellow');
    log('   npm run db:migrate', 'cyan');
    log('   npm run db:seed', 'cyan');
    log('   npm run db:seed 5', 'cyan');
    log('   npm run db:seed-courses', 'cyan');
    log('   npm run db:seed-courses 10', 'cyan');
    log('   npm run db:check', 'cyan');

    log('\n🔗 Available npm scripts:', 'green');
    log('   npm run db:migrate      - Apply migrations', 'cyan');
    log('   npm run db:seed         - Populate users', 'cyan');
    log('   npm run db:seed-courses - Populate courses', 'cyan');
    log('   npm run db:check        - Check status', 'cyan');
    log('   npm run db:setup        - Initial setup', 'cyan');
    log('   npm run db:reset        - Reset database', 'cyan');

    log('\n📚 Documentation:', 'green');
    log('   docs/migracoes-drizzle.md - Migration guide', 'cyan');
    log('   docs/drizzle-studio-setup.md - Studio configuration', 'cyan');
}

function migrate() {
    log('🗄️  Applying migrations to the database...', 'bright');
    execCommand('node src/scripts/database/apply-migration.js', 'Applying migrations');
}

function check() {
    log('🔍 Checking status of the database...', 'bright');
    execCommand('node src/scripts/database/check-db.js', 'Checking status');
}

function seedUsers() {
    log('🌱 Populating database with users...', 'bright');
    const quantity = process.argv[3] ? parseInt(process.argv[3]) : undefined;
    execCommand(`tsx src/database/seed-users.ts ${quantity !== undefined ? quantity : ''}`, 'Populating users');
}

function seedCourses() {
    log('🌱 Populating database with courses...', 'bright');
    const limit = process.argv[3] ? parseInt(process.argv[3]) : undefined;
    execCommand(`tsx src/database/seed-courses.ts ${limit !== undefined ? limit : ''}`, 'Populating courses');
}

function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            migrate();
            break;
            
        case 'check':
            check();
            break;

        case 'seed-users':
            seedUsers();
            break;
        
        case 'seed-courses':
            seedCourses();
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
            log('\n💡 Use "npm run db:help" to see available commands', 'yellow');
            showHelp();
            process.exit(1);
    }
}

// Execute only if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
    main();
}

export { main, migrate, check, seedUsers, seedCourses };
