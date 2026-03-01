const { PrismaClient } = require('@prisma/client');
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

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not found in community-vite/.env');
    process.exit(1);
}

const prisma = new PrismaClient();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    try {
        console.log('Fetching data from local Prisma...');

        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users.`);
        for (const user of users) {
            const { error } = await supabase.from('User').upsert(user);
            if (error) console.error(`User ${user.email} migration error:`, error.message);
        }

        const families = await prisma.family.findMany();
        console.log(`Found ${families.length} families.`);
        for (const family of families) {
            // Fix district/city mapping if necessary
            const familyData = { ...family };
            if (!familyData.district && familyData.city) {
                familyData.district = familyData.city;
            }
            const { error } = await supabase.from('Family').upsert(familyData);
            if (error) console.error(`Family ${family.familyId} migration error:`, error.message);
        }

        const members = await prisma.member.findMany();
        console.log(`Found ${members.length} members.`);
        for (const member of members) {
            const { error } = await supabase.from('Member').upsert(member);
            if (error) console.error(`Member ${member.fullName} migration error:`, error.message);
        }

        console.log('Migration to Supabase finished!');
    } catch (e) {
        console.error('Fatal migration error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
Broadway
