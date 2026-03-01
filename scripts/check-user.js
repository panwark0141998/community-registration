const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env or .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(email) {
    console.log(`Checking user: ${email}...`);
    const { data, error } = await supabase
        .from('User')
        .select('id, email, role, status, createdAt')
        .eq('email', email);

    if (error) {
        console.error("Error fetching user:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("User found:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("User NOT found in database.");
    }
}

const email = process.argv[2] || 'panwark014@gmail.com';
checkUser(email);
