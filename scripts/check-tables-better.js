const Database = require('better-sqlite3');
const db = new Database('./dev.db', { readonly: true });
const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
console.log(stmt.all());
db.close();
