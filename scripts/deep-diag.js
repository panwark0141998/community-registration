async function diagnostic() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    console.log('--- USERS ---');
    const users = await (await fetch(`${baseUrl}/User?select=id,email,role,name`, { headers })).json();
    console.table(users);

    console.log('\n--- FAMILIES ---');
    const families = await (await fetch(`${baseUrl}/Family?select=id,familyId,representativeId,headOfFamily`, { headers })).json();
    console.table(families);

    if (families.length > 0) {
        console.log('\n--- SAMPLE FAMILY MEMBERS COUNT ---');
        const familyId = families[0].id;
        const membersCount = await (await fetch(`${baseUrl}/Member?select=id&familyId=eq.${familyId}`, { headers })).json();
        console.log(`Family ${familyId} has ${membersCount.length} members.`);
    }
}

diagnostic();
