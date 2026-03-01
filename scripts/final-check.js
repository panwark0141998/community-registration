async function check() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    try {
        const users = await (await fetch(`${baseUrl}/User?select=id,email,name`, { headers })).json();
        const families = await (await fetch(`${baseUrl}/Family?select=id,representativeId,headOfFamily`, { headers })).json();

        console.log('--- ALL USERS ---');
        users.forEach(u => console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name}`));

        console.log('\n--- ALL FAMILIES ---');
        families.forEach(f => console.log(`ID: ${f.id} | RepID: ${f.representativeId} | Head: ${f.headOfFamily}`));

        const rahul = users.find(u => u.email === 'rahulpanwar0144@gmail.com');
        const family = families.find(f => f.representativeId === rahul?.id);

        if (rahul && family) {
            console.log(`\n✅ MATCH FOUND: Rahul's ID (${rahul.id}) matches Family's RepID (${family.representativeId})`);
        } else {
            console.log('\n❌ NO MATCH: Rahul is not linked to any family.');
        }

    } catch (e) {
        console.error(e);
    }
}

check();
