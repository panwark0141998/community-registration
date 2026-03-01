async function test() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    const userId = '56a48a2b-1646-48e2-a990-22394c87320a'; // Admin User

    console.log('--- Testing select("*,members(*)") ---');
    try {
        const res = await fetch(`${baseUrl}/Family?select=*,members(*)&representativeId=eq.${userId}`, { headers });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.ok) console.log('Found:', data.length, 'families');
        else console.log('Error:', data);
    } catch (e) {
        console.error('Failed:', e.message);
    }

    console.log('\n--- Testing select("*,Member(*)") ---');
    try {
        const res = await fetch(`${baseUrl}/Family?select=*,Member(*)&representativeId=eq.${userId}`, { headers });
        const data = await res.json();
        console.log('Status:', res.status);
        if (res.ok) console.log('Found:', data.length, 'families');
        else console.log('Error:', data);
    } catch (e) {
        console.error('Failed:', e.message);
    }
}

test();
