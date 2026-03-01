const http = require('http');

async function test() {
    console.log('--- Testing API/FAMILIES/ME ---');

    // 1. Login to get token
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'panwark014@gmail.com', // Admin User
            password: 'password123' // I'll assume this based on previous migration scripts
        })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        // Try other email
        console.log('Trying Rahul...');
        const loginRes2 = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'rahulpanwar0144@gmail.com',
                password: 'password123'
            })
        });
        if (!loginRes2.ok) {
            console.error('Both logins failed. End.');
            return;
        }
        var authRes = loginRes2;
    } else {
        var authRes = loginRes;
    }

    const setCookie = authRes.headers.get('set-cookie');
    const tokenCookie = setCookie.split(';')[0];
    console.log('Login Success. Cookie:', tokenCookie);

    // 2. Call Families Me
    console.log('\n--- Calling /api/families/me ---');
    const res = await fetch('http://localhost:3000/api/families/me', {
        headers: { 'Cookie': tokenCookie }
    });

    console.log('Status:', res.status);
    const data = await res.text();
    try {
        console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
        console.log('Response (text):', data);
    }
}

test();
