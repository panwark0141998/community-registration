async function verify() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    try {
        console.log('--- USER: RAHUL PANWAR ---');
        const users = await (await fetch(`${baseUrl}/User?email=eq.rahulpanwar0144@gmail.com`, { headers })).json();
        console.log(JSON.stringify(users, null, 2));

        if (users.length > 0) {
            const userId = users[0].id;
            console.log(`\n--- SEARCHING FAMILY FOR USER ID: ${userId} ---`);
            const families = await (await fetch(`${baseUrl}/Family?representativeId=eq.${userId}&select=*,members(*)`, { headers })).json();
            console.log(JSON.stringify(families, null, 2));
        }

        console.log('\n--- ALL FAMILIES (Raw) ---');
        const allFamilies = await (await fetch(`${baseUrl}/Family?select=*`, { headers })).json();
        console.log(JSON.stringify(allFamilies, null, 2));

    } catch (e) {
        console.error('Verification failed:', e);
    }
}

verify();
