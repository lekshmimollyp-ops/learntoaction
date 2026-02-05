const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5432/learntoaction',
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to DB.');

    // 1. Inspect User Table Schema
    console.log('\n--- SCHEMA CHECK: User ---');
    const cols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User'
    `);
    
    if (cols.rows.length === 0) {
        console.log('⚠️ Table "User" not found. Checking for "user" (lowercase)...');
        const colsLower = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user'
        `);
        console.table(colsLower.rows);
    } else {
        console.table(cols.rows);
    }

    // 2. Try to Insert Admin
    console.log('\n--- SEEDING ADMIN ---');
    const email = 'admin@learntoaction.com';
    const password = 'password';
    const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';

    // Ensure Workspace
    await client.query(
        `INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`,
        [WORKSPACE_ID, 'Default Workspace']
    );

    try {
        await client.query(
          `INSERT INTO "User" ("id", "email", "passwordHash", "workspaceId", "updatedAt")
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT ("email") DO NOTHING`,
          [crypto.randomUUID(), email, password, WORKSPACE_ID]
        );
        console.log('✅ Admin user ready (inserted or existed).');
    } catch (e) {
        console.error('❌ Insert failed:', e.message);
        
        // Debug: Try inserting into "user" just in case
        if (e.message.includes('does not exist')) {
            console.log('Trying insert into "user"...');
             try {
                await client.query(
                  `INSERT INTO "user" (id, email, passwordHash, workspaceId, "updatedAt")
                   VALUES ($1, $2, $3, $4, NOW())`,
                  [crypto.randomUUID(), email, password, WORKSPACE_ID]
                );
                console.log('✅ Admin inserted into "user".');
            } catch (e2) {
                console.error('❌ "user" insert failed:', e2.message);
            }
        }
    }

  } catch (err) {
    console.error('Global Error:', err);
  } finally {
    await client.end();
  }
}

main();
