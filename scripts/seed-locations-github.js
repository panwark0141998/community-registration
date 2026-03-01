const fs = require('fs');
const https = require('https');

const SUPABASE_URL = "https://zzydkdemjzugrguzsdsp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn";

// GitHub repo info
const REPO_URL = 'https://raw.githubusercontent.com/pranshumaheshwari/indian-cities-and-villages/master/By%20States';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

function getJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Nodejs' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return getJSON(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} at ${url}`));
            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function uploadToSupabase(table, dataBatch) {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates" // Prevent unique constraint errors if any
        },
        body: JSON.stringify(dataBatch),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase Error (${response.status}): ${errorText}`);
    }
}

async function fetchGitHubTree() {
    const treeUrl = 'https://api.github.com/repos/pranshumaheshwari/indian-cities-and-villages/git/trees/master?recursive=1';
    const response = await fetch(treeUrl, { headers: { 'User-Agent': 'Nodejs' } });
    const json = await response.json();
    if (!json.tree) throw new Error("Could not fetch GitHub tree");
    return json.tree
        .filter(t => t.path.startsWith('By States/') && t.path.endsWith('.json'))
        .map(t => t.path);
}

async function migrate() {
    try {
        console.log("Fetching list of State JSON files from GitHub...");
        const jsonFiles = await fetchGitHubTree();
        console.log(`Found ${jsonFiles.length} State files.`);

        let totalUploaded = 0;

        for (const filePath of jsonFiles) {
            // E.g. "By States/Rajasthan.json" -> "Rajasthan"
            const stateName = filePath.replace('By States/', '').replace('.json', '');

            // Wait heavily requested by the user: `https://vlist.in/state/08.html`
            // If the user wants ALL states, we will do all, but we will start with Rajasthan as priority or do them all.
            // Let's do it alphabetically but process all.
            console.log(`\n========================================`);
            console.log(`Downloading data for ${stateName}...`);

            const rawUrl = `https://raw.githubusercontent.com/pranshumaheshwari/indian-cities-and-villages/master/${encodeURIComponent(filePath)}`;
            const stateData = await getJSON(rawUrl);

            const flatLocations = [];
            if (stateData.districts) {
                for (const d of stateData.districts) {
                    if (d.subDistricts) {
                        for (const sd of d.subDistricts) {
                            if (sd.villages) {
                                for (const v of sd.villages) {
                                    flatLocations.push({
                                        state: stateName,
                                        district: d.district,
                                        subDistrict: sd.subDistrict,
                                        village: v
                                    });
                                }
                            }
                        }
                    }
                }
            }

            console.log(`Parsed ${flatLocations.length} villages for ${stateName}.`);
            if (flatLocations.length === 0) continue;

            const batchSize = 1000;
            let uploadedState = 0;
            for (let i = 0; i < flatLocations.length; i += batchSize) {
                const batch = flatLocations.slice(i, i + batchSize);
                let retries = 3;
                while (retries > 0) {
                    try {
                        await uploadToSupabase('Location', batch);
                        uploadedState += batch.length;
                        process.stdout.write(`\rUploaded ${uploadedState} / ${flatLocations.length}...`);
                        break;
                    } catch (e) {
                        retries--;
                        if (retries === 0) {
                            console.error(`\nFailed to upload batch at index ${i}:`, e.message);
                            throw e;
                        }
                        await delay(2000); // Wait 2 seconds before retry
                    }
                }
            }
            totalUploaded += flatLocations.length;
            console.log(`\nFinished ${stateName}! Total globally uploaded so far: ${totalUploaded}`);
        }

        console.log(`\nSUCCESS! Uploaded a grand total of ${totalUploaded} villages to Supabase Location table.`);

    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate();
