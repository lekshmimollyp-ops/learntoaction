const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5432/learntoaction',
});

async function seedUser() {
  try {
    await client.connect();

    // 1. Ensure Workspace
    const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
    await client.query(
        `INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`,
        [WORKSPACE_ID, 'Default Workspace']
    );

    console.log('Dropping User table...');
    await client.query(`DROP TABLE IF EXISTS "User" CASCADE`);
    
    console.log('Creating User table...');
    await client.query(`
      CREATE TABLE "User" (
        "id" text NOT NULL,
        "email" text NOT NULL,
        "passwordHash" text NOT NULL,
        "workspaceId" text NOT NULL,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id")
      )
    `);
    console.log('User table created.');

    // 3. Insert Admin User
    const email = 'admin@learntoaction.com';
    const passwordHash = 'password'; 

    console.log('Inserting user...');
    try {
        await client.query(
        `INSERT INTO "User" ("id", "email", "passwordHash", "workspaceId", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW())`,
        [crypto.randomUUID(), email, passwordHash, WORKSPACE_ID]
        );
        console.log('✅ Admin user seeded successfully!');
    } catch (insertErr) {
        console.error('INSERT FAILED');
        console.error(insertErr.message);
        
        // Inspect table to see what happened
        const debug = await client.query('SELECT * FROM "User"');
        console.log('Current User table rows:', debug.rows.length);
    }
    
  } catch (err) {
    console.error('Global Error:', err);
  } finally {
    await client.end();
  }
}

seedUser();
