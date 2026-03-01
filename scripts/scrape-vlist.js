const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/rajasthan-locations.json');
const BASE_URL = 'https://vlist.in';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

function get(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        };

        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Handle redirects if any
                return get(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function fetchWithRetry(url, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await delay(1000 + Math.random() * 500); // 1-1.5s delay
            return await get(url);
        } catch (err) {
            console.error(`  [Attempt ${i + 1}/${retries}] Failed to fetch ${url} - ${err.message}`);
            if (i === retries - 1) throw err;
            await delay(3000 * (i + 1)); // Exponential-ish backoff
        }
    }
}

const distRegex = /<a href="\/district\/(\d+)\.html"[^>]*>([^<]+)<\/a>/g;
const tehsilRegex = /<a href="\/sub-district\/(\d+)\.html"(?: title="[^"]*")?>([^<]+)<\/a>/g;
const villageRegex = /<td><a href="\/village\/(\d+)\.html"[^>]*>([^<]+)<\/a><\/td>/g;

async function scrapeRajasthan() {
    console.log("Starting Reliable Scraper for Rajasthan (State 08)...");

    // Check if we have progress saved
    let flatLocations = [];
    let completedTehsils = new Set();
    if (fs.existsSync(OUTPUT_FILE)) {
        flatLocations = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        completedTehsils = new Set(flatLocations.map(f => f.subDistrict));
        console.log(`Resuming from ${completedTehsils.size} already processed Tehsils...`);
    }

    const stateHtml = await fetchWithRetry(`${BASE_URL}/state/08.html`);
    const districts = [];
    let match;
    while ((match = distRegex.exec(stateHtml)) !== null) {
        districts.push({ code: match[1], name: match[2].trim(), tehsils: [] });
    }
    console.log(`Found ${districts.length} Districts.`);

    for (const district of districts) {
        process.stdout.write(`Fetching Tehsils for ${district.name}... `);
        const distHtml = await fetchWithRetry(`${BASE_URL}/district/${district.code}.html`);

        const tehsilsMap = new Map();
        let tehMatch;
        while ((tehMatch = tehsilRegex.exec(distHtml)) !== null) {
            tehsilsMap.set(tehMatch[1], { code: tehMatch[1], name: tehMatch[2].trim() });
        }

        district.tehsils = Array.from(tehsilsMap.values());
        console.log(`found ${district.tehsils.length} Tehsils.`);
    }

    let allTehsils = [];
    districts.forEach(d => {
        d.tehsils.forEach(t => {
            allTehsils.push({ districtName: d.name, tehsil: t });
        });
    });

    console.log(`\nFetching Villages for ${allTehsils.length} total Tehsils (Sequential)...`);

    let processedCount = 0;

    for (const { districtName, tehsil } of allTehsils) {
        if (completedTehsils.has(tehsil.name)) {
            // Already processed this tehsil in previous run
            processedCount++;
            continue;
        }

        try {
            const tehHtml = await fetchWithRetry(`${BASE_URL}/sub-district/${tehsil.code}.html`);
            const villages = [];
            let vMatch;
            while ((vMatch = villageRegex.exec(tehHtml)) !== null) {
                const vName = vMatch[2].trim();
                const vCode = vMatch[1];
                villages.push({ name: vName, code: vCode });
                flatLocations.push({
                    state: "Rajasthan",
                    district: districtName,
                    subDistrict: tehsil.name,
                    village: vName,
                    vlistCode: vCode
                });
            }
            processedCount++;

            // Auto save every tehsil so we don't lose data
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(flatLocations, null, 2));

            if (processedCount % 10 === 0) {
                console.log(`  Progress: ${processedCount}/${allTehsils.length} tehsils processed... (${flatLocations.length} villages total)`);
            }
        } catch (e) {
            console.error(`\nFINAL ERROR fetching Tehsil ${tehsil.name} (${tehsil.code}):`, e.message);
        }
    }

    console.log(`\nScraping completely finished! Total Villages Extracted: ${flatLocations.length}`);
}

scrapeRajasthan().catch(e => console.error("Fatal Error:", e));
