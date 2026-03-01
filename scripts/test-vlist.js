const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function test() {
    console.log("Fetching Tehsil 00607 (Ajmer)...");
    const tehHtml = await get('https://vlist.in/sub-district/00607.html');

    console.log("HTML Snippet around villages:");
    const idx = tehHtml.indexOf('<tr class="cell0">');
    if (idx !== -1) {
        console.log(tehHtml.substring(Math.max(0, idx - 50), idx + 250));
    } else {
        console.log("No table rows found!");
        console.log(tehHtml.substring(400, 1000));
    }
}

test();
