const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SUPABASE_URL = "https://zzydkdemjzugrguzsdsp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn";

const supabaseFetch = async (table, data) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error(`Error migrating to ${table}:`, error.message);
    }
    return response.ok;
};

async function migrate() {
    const dbPath = path.resolve(__dirname, '../dev.db');
    if (!fs.existsSync(dbPath)) {
        console.error('SQLite database not found at:', dbPath);
        return;
    }

    const db = new Database(dbPath, { readonly: true });
    console.log('Connected to local SQLite database.');

    try {
        // 1. Migrate Users
        console.log('Migrating Users...');
        const users = db.prepare('SELECT * FROM "User"').all();
        if (users.length > 0) {
            await supabaseFetch('User', users);
            console.log(`Migrated ${users.length} users.`);
        }

        // 2. Migrate Families
        console.log('Migrating Families...');
        const families = db.prepare('SELECT * FROM "Family"').all();
        if (families.length > 0) {
            // Map district correctly
            const familiesToMigrate = families.map(f => ({
                ...f,
                district: f.district || f.city || ""
            }));
            await supabaseFetch('Family', familiesToMigrate);
            console.log(`Migrated ${families.length} families.`);
        }

        // 3. Migrate Members
        console.log('Migrating Members...');
        const members = db.prepare('SELECT * FROM "Member"').all();
        if (members.length > 0) {
            const membersToMigrate = members.map(m => ({
                ...m,
                isAlive: m.isAlive === 1
            }));
            await supabaseFetch('Member', membersToMigrate);
            console.log(`Migrated ${members.length} members.`);
        }

        console.log('Migration completed successfully!');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        db.close();
    }
}

migrate();
