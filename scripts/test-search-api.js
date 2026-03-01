async function test() {
    const SUPABASE_URL = "https://zzydkdemjzugrguzsdsp.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn";

    const supabaseFetch = async (path, options = {}) => {
        const url = `${SUPABASE_URL}/rest/v1/${path}`;
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
            ...options.headers,
        };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Supabase request failed");
        }
        return await response.json();
    };

    const supabase = {
        from: (table) => {
            let selectStr = "*";
            const filters = [];
            let limitVal = null;
            let orderStr = null;
            const builder = {
                select: (columns = "*") => { selectStr = columns; return builder; },
                filter: (column, operator, value) => { filters.push(`${column}=${operator}.${value}`); return builder; },
                eq: (column, value) => { filters.push(`${column}=eq.${value}`); return builder; },
                ilike: (column, pattern) => { filters.push(`${column}=ilike.${pattern}`); return builder; },
                or: (conditions) => { filters.push(`or=${conditions}`); return builder; },
                limit: (count) => { limitVal = count; return builder; },
                all: async () => {
                    const params = new URLSearchParams();
                    params.append("select", selectStr);
                    filters.forEach(f => {
                        const splitIndex = f.indexOf("=");
                        const k = f.substring(0, splitIndex);
                        const v = f.substring(splitIndex + 1);
                        params.append(k, v);
                    });
                    if (limitVal) params.append("limit", limitVal.toString());
                    console.log(`URL being queried: ${table}?${params.toString()}`);
                    return await supabaseFetch(`${table}?${params.toString()}`, { method: "GET" });
                }
            };
            return builder;
        }
    };

    try {
        let familyQuery = supabase.from('Family').select('*');
        const familiesRes = await familyQuery.limit(50).all();
        console.log("Found:", familiesRes.length);
    } catch (e) {
        console.error("Test failed:", e);
    }
}
test();
