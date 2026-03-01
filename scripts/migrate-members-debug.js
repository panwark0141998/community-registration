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
            "Prefer": "resolution=merge-duplicates, return=representation"
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        try {
            const error = await response.json();
            console.error(`Error migrating to ${table}:`, error);
        } catch (e) {
            console.error(`Error migrating to ${table} (non-json):`, await response.text());
        }
    } else {
        const result = await response.json();
        console.log(`Successfully migrated ${result.length} records to ${table}.`);
    }
    return response.ok;
};

async function migrate() {
    const dbPath = path.resolve(__dirname, '../dev.db');
    const db = new Database(dbPath, { readonly: true });

    try {
        console.log('Migrating Members only...');
        const members = db.prepare('SELECT * FROM "Member"').all();
        console.log(`Found ${members.length} members in SQLite.`);

        if (members.length > 0) {
            const membersToMigrate = members.map(m => ({
                ...m,
                isAlive: m.isAlive === 1 || m.isAlive === true
            }));
            await supabaseFetch('Member', membersToMigrate);
        }
    } catch (e) {
        console.error('Migration fatal error:', e);
    } finally {
        db.close();
    }
}

migrate();
