const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log("Families:", db.prepare('SELECT * FROM Family').all());
console.log("Users:", db.prepare('SELECT id, email, role FROM User').all());
