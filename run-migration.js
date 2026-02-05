const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5432/learntoaction',
});

async function main() {
  await client.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log('Schema created successfully');
  } catch (err) {
    console.error('Error executing schema', err);
  } finally {
    await client.end();
  }
}

main();
