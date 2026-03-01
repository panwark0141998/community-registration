const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SUPABASE_URL = "https://zzydkdemjzugrguzsdsp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn";

const supabaseFetch = async (endpoint, method, data) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const options = {
        method: method,
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
        console.error(`Error on ${endpoint} (${method}):`, text);
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
};

async function run() {
    const dbPath = path.resolve(__dirname, '../dev.db');
    const db = new Database(dbPath, { readonly: true });

    try {
        console.log('1. Fixing Districts for Families in Supabase...');
        const sqliteFamilies = db.prepare('SELECT * FROM Family').all();

        for (const f of sqliteFamilies) {
            const district = f.district || f.city || "Kota"; // Fallback to Kota if both empty
            console.log(`Updating family ${f.id} with district: ${district}`);
            await supabaseFetch(`Family?id=eq.${f.id}`, 'PATCH', { district });
        }

        console.log('2. Migrating Members sequentially...');
        const sqliteMembers = db.prepare('SELECT * FROM Member').all();
        console.log(`Found ${sqliteMembers.length} members in SQLite.`);

        for (const m of sqliteMembers) {
            const memberData = {
                ...m,
                isAlive: m.isAlive === 1 || m.isAlive === true
            };
            // Remove null fields if they cause issues, but usually they are fine
            console.log(`Migrating member: ${m.fullName} (${m.id})`);
            const result = await supabaseFetch('Member', 'POST', memberData);
            if (result) {
                console.log(`Successfully migrated ${m.fullName}`);
            } else {
                console.error(`Failed to migrate ${m.fullName}`);
            }
        }

        console.log('All operations completed.');
    } catch (e) {
        console.error('Fatal error:', e);
    } finally {
        db.close();
    }
}

run();
