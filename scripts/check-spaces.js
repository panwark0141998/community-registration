async function checkSpaces() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    const targetId = '56a48a2b-1646-48e2-a990-22394c87320a';

    console.log('--- SPACE CHECK ---');
    const families = await (await fetch(`${baseUrl}/Family?select=id,representativeId,headOfFamily`, { headers })).json();

    for (const f of families) {
        const repId = f.representativeId;
        console.log(`Family Head: ${f.headOfFamily}`);
        console.log(`Rep ID in DB: "${repId}" (Length: ${repId.length})`);
        console.log(`Target ID:     "${targetId}" (Length: ${targetId.length})`);
        console.log(`Match? ${repId === targetId}`);
    }
}

checkSpaces();
