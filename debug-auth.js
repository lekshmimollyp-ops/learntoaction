const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5432/learntoaction',
});

async function main() {
  try {
    await client.connect();
    console.log('Connected.');

    // 1. Check Table Existence
    console.log('\n--- Tables ---');
    const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
    console.table(tables.rows);

    // 2. Check User Columns
    console.log('\n--- User Columns ---');
    try {
        const cols = await client.query(`SELECT * FROM "User" LIMIT 1`);
        if (cols.rows.length > 0) {
            console.log('Columns found:', Object.keys(cols.rows[0]));
            // Check content
            console.log('Sample User:', cols.rows[0]);
        } else {
            console.log('Table "User" exists but is empty.');
            // Check columns from empty result
            console.log('Fields:', cols.fields.map(f => f.name));
        }
    } catch (e) {
        console.error('Failed to select from "User":', e.message);
    }

    // 3. Simulate Login Query
    console.log('\n--- Simulate Login ---');
    const email = 'admin@learntoaction.com'; // Try correct one
    try {
        const res = await client.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
        console.log(`Found ${res.rows.length} users for ${email}`);
    } catch (e) {
        console.error('Login Query Failed:', e.message);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
