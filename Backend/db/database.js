const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'skyroute.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = DELETE');
        db.pragma('foreign_keys = ON');

        // Apply schema on first connect if tables don't exist
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.exec(schema);
    }
    return db;
}

module.exports = { getDb };
