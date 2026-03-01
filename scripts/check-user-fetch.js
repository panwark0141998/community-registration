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

async function checkUser(email) {
    console.log(`Checking user: ${email} via fetch...`);

    const url = `${supabaseUrl}/rest/v1/User?email=eq.${encodeURIComponent(email)}&select=id,email,role,status,createdAt`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error fetching user:", err.message || response.statusText);
            return;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            console.log("User found in Supabase:");
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("User NOT found in Supabase.");
        }
    } catch (error) {
        console.error("Fetch error:", error.message);
    }
}

const email = process.argv[2] || 'panwark014@gmail.com';
checkUser(email);
