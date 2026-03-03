const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_SgOB0mPX2wDZ@ep-damp-base-abmc3ie5.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function test() {
    const client = new Client({ connectionString });
    try {
        console.log('Connecting to Neon...');
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
}

test();
