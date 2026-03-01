async function testApi() {
    try {
        const jwt = require("jsonwebtoken");
        // Get secret from .env.local
        const fs = require('fs');
        let secret = "fallback_secret";
        try {
            const env = fs.readFileSync('.env.local', 'utf8');
            const match = env.match(/JWT_SECRET=(.*)/);
            if (match) secret = match[1].trim();
        } catch (e) { }

        const token = jwt.sign({ userId: 'test_user', role: 'family_rep' }, secret);

        console.log("Mocked token, calling /api/search with NO parameters ...");
        const res = await fetch("http://localhost:3000/api/search", {
            headers: { "Cookie": `token=${token}` }
        });

        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Data length:", data.length);
        } else {
            const error = await res.text();
            console.log("API Error Error:", error);
        }
    } catch (e) {
        console.error("Script failed:", e);
    }
}
testApi();
