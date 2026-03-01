const { createClient } = require('C:\\Users\\panwa\\.gemini\\antigravity\\scratch\\community-vite\\node_modules\\@supabase\\supabase-js\\dist\\index.cjs');

const supabaseUrl = "https://zzydkdemjzugrguzsdsp.supabase.co";
const supabaseAnonKey = "sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('User').select('id').limit(1);

        if (error) {
            console.error('Error fetching from User table:', error.message);
            if (error.message.includes('relation "public.User" does not exist')) {
                console.log('User table does not exist. We may need to run the schema first.');
            }
        } else {
            console.log('Supabase connection successful!');
            console.log('Data found in User table:', data.length);
        }
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

test();
