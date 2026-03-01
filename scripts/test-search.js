async function testSearchQuery() {
    const baseUrl = 'http://localhost:3000/api/search'; // Test through our API

    // First, verify families can be fetched from Supabase directly via the REST without join
    const sbUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    console.log('Testing raw Family fetch...');
    const fRes = await fetch(`${sbUrl}/Family?select=*`, { headers });
    const families = await fRes.json();
    console.log('Families count:', families.length);

    console.log('Testing raw Member fetch...');
    const mRes = await fetch(`${sbUrl}/Member?select=*`, { headers });
    const members = await mRes.json();
    console.log('Members count:', members.length);
}

testSearchQuery();
