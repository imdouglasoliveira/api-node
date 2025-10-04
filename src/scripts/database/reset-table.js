import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../database/dev.db');

// Tabelas disponíveis
const AVAILABLE_TABLES = ['users', 'courses', 'enrollments'];

function resetTable(tableName) {
    console.log(`🗑️  Resetando tabela: ${tableName}`);

    try {
        const sqlite = new Database(DB_PATH);

        // Deletar todos os registros
        const deleteStmt = sqlite.prepare(`DELETE FROM ${tableName}`);
        const result = deleteStmt.run();

        // Resetar o autoincrement (SQLite)
        const resetStmt = sqlite.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`);
        resetStmt.run(tableName);

        console.log(`✅ Tabela ${tableName} resetada com sucesso!`);
        console.log(`   Registros deletados: ${result.changes}`);

        sqlite.close();

    } catch (error) {
        console.error(`❌ Erro ao resetar tabela ${tableName}:`, error.message);
        process.exit(1);
    }
}

function resetAllTables() {
    console.log('🗑️  Resetando TODAS as tabelas...\n');

    AVAILABLE_TABLES.forEach(table => {
        resetTable(table);
    });

    console.log('\n🎉 Todas as tabelas foram resetadas!');
}

// Processar argumentos da linha de comando
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'all') {
        resetAllTables();
        return;
    }

    const tableName = args[0];

    if (!AVAILABLE_TABLES.includes(tableName)) {
        console.error(`❌ Tabela inválida: ${tableName}`);
        console.log(`\nTabelas disponíveis: ${AVAILABLE_TABLES.join(', ')}`);
        console.log('\nUso:');
        console.log('  node reset-table.js [tabela]');
        console.log('  node reset-table.js all  (reseta todas as tabelas)');
        console.log('\nExemplos:');
        console.log('  node reset-table.js users');
        console.log('  node reset-table.js courses');
        console.log('  node reset-table.js all');
        process.exit(1);
    }

    resetTable(tableName);
}

main();
