
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzydkdemjzugrguzsdsp.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn";

export const supabaseFetch = async (path: string, options: RequestInit = {}) => {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Supabase request failed");
    }

    return await response.json();
};

export const supabase = {
    from: (table: string) => {
        let selectStr = "*";
        const filters: string[] = [];
        let limitVal: number | null = null;
        let orderStr: string | null = null;

        const builder = {
            select: (columns = "*") => {
                selectStr = columns;
                return builder;
            },
            filter: (column: string, operator: string, value: any) => {
                filters.push(`${column}=${operator}.${value}`);
                return builder;
            },
            eq: (column: string, value: any) => {
                filters.push(`${column}=eq.${value}`);
                return builder;
            },
            like: (column: string, pattern: string) => {
                filters.push(`${column}=like.${pattern}`);
                return builder;
            },
            ilike: (column: string, pattern: string) => {
                filters.push(`${column}=ilike.${pattern}`);
                return builder;
            },
            or: (conditions: string) => {
                // conditions should be a string like "(col.op.val,col.op.val)"
                // We add it directly to filters without the column= operator
                filters.push(`or=${conditions}`);
                return builder;
            },
            order: (column: string, { ascending = true } = {}) => {
                orderStr = `${column}.${ascending ? "asc" : "desc"}`;
                return builder;
            },
            limit: (count: number) => {
                limitVal = count;
                return builder;
            },
            all: async () => {
                const params = new URLSearchParams();
                params.append("select", selectStr);
                filters.forEach(f => {
                    const splitIndex = f.indexOf("=");
                    const k = f.substring(0, splitIndex);
                    const v = f.substring(splitIndex + 1);
                    params.append(k, v);
                });
                if (orderStr) params.append("order", orderStr);
                if (limitVal) params.append("limit", limitVal.toString());

                return await supabaseFetch(`${table}?${params.toString()}`, { method: "GET" });
            },
            single: async () => {
                const data = await builder.all();
                return data[0] || null;
            }
        };

        return {
            ...builder,
            insert: async (data: any) => {
                return await supabaseFetch(table, {
                    method: "POST",
                    body: JSON.stringify(data),
                });
            },
            upsert: async (data: any) => {
                return await supabaseFetch(table, {
                    method: "POST",
                    headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
                    body: JSON.stringify(data),
                });
            },
            update: (data: any) => ({
                eq: async (column: string, value: any) => {
                    return await supabaseFetch(`${table}?${column}=eq.${value}`, {
                        method: "PATCH",
                        body: JSON.stringify(data),
                    });
                }
            }),
            delete: () => ({
                eq: async (column: string, value: any) => {
                    return await supabaseFetch(`${table}?${column}=eq.${value}`, {
                        method: "DELETE",
                    });
                }
            })
        };
    }
};
