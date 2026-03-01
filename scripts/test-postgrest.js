async function testPostgREST() {
    const sbUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    console.time("Search with specific text");
    // Test text search via PostgREST (ilike on headOfFamily)
    const res = await fetch(`${sbUrl}/Family?select=id,familyId,headOfFamily,caste&headOfFamily=ilike.*RAMGOPAL*&limit=50`, { headers });
    const data = await res.json();
    console.timeEnd("Search with specific text");

    console.log("Found:", data.length, "families");
    console.log("First item:", data[0]);

    console.time("Search all with limit");
    // Test no filter with limit
    const resAll = await fetch(`${sbUrl}/Family?select=id,familyId,headOfFamily,caste&limit=50`, { headers });
    const dataAll = await resAll.json();
    console.timeEnd("Search all with limit");
    console.log("Found:", dataAll.length, "families limited");
}

testPostgREST();
