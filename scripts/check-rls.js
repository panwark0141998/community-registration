async function checkRLS() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    // We can check if RPC run_sql exists or use another trick
    // Actually, we can just try to fetch from a protected view or something
    // But let's try to fetch a known table that we KNOW has data and see if it works

    console.log('--- RLS CHECK ---');
    const res = await fetch(`${baseUrl}/Family?select=id`, { headers });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data count:', Array.isArray(data) ? data.length : 'Not an array');

    if (Array.isArray(data) && data.length === 0) {
        console.log('CRITICAL: Table Family returned 0 records even with anon key. RLS might be active.');
    } else if (!Array.isArray(data)) {
        console.log('Error from Supabase:', data);
    } else {
        console.log('RLS seems to be OFF or policies allow access.');
    }
}

checkRLS();
