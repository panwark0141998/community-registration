async function run() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Content-Type': 'application/json'
    };

    const sql = 'CREATE INDEX IF NOT EXISTS "idx_member_familyId" ON "Member"("familyId");';

    try {
        const res = await fetch(`${baseUrl}/rpc/run_sql`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ sql })
        });
        const data = await res.text();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}
run();
