const initSqlJs = require('sql.js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env from community-vite/.env
const viteEnvPath = path.resolve(__dirname, '../../community-vite/.env');
const envContent = fs.readFileSync(viteEnvPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    const dbPath = path.resolve(__dirname, '../dev.db');
    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);

    const getRows = (query) => {
        const stmt = db.prepare(query);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
    };

    console.log('Migrating Users...');
    const users = getRows('SELECT * FROM "User"');
    for (const user of users) {
        const { error } = await supabase.from('User').upsert(user);
        if (error) console.error(error.message);
    }

    console.log('Migrating Families...');
    const families = getRows('SELECT * FROM "Family"');
    for (const family of families) {
        const { error } = await supabase.from('Family').upsert(family);
        if (error) console.error(error.message);
    }

    console.log('Migrating Members...');
    const members = getRows('SELECT * FROM "Member"');
    for (const member of members) {
        const { error } = await supabase.from('Member').upsert({
            ...member,
            isAlive: member.isAlive === 1
        });
        if (error) console.error(error.message);
    }

    console.log('Migration completed!');
}

migrate();
Broadway
