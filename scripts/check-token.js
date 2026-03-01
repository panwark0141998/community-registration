const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function checkToken() {
    const baseUrl = 'https://zzydkdemjzugrguzsdsp.supabase.co/rest/v1';
    const headers = {
        'apikey': 'sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn',
        'Authorization': 'Bearer sb_publishable__N2bCHRZm5pR9Ofx24_Psg_LybAharn'
    };

    const email = 'panwark014@gmail.com';
    const password = 'password123';
    const secret = 'supersecretjwtkey_please_change_this_in_production';

    console.log('--- LOGIN CHECK ---');
    const userRes = await fetch(`${baseUrl}/User?email=eq.${email}&select=*`, { headers });
    const users = await userRes.json();

    if (users.length === 0) {
        console.log('User not found in DB!');
        return;
    }
    const user = users[0];
    console.log('User from DB:', { id: user.id, email: user.email, role: user.role });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch);

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        secret,
        { expiresIn: "7d" }
    );
    console.log('Generated Token Payload:', jwt.decode(token));
}

checkToken();
