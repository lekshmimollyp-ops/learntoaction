const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5432/postgres',
});
client.connect()
  .then(async () => {
    try {
      await client.query('CREATE DATABASE learntoaction');
      console.log('Database created successfully');
    } catch (e) {
      if (e.code === '42P04') {
         console.log('Database already exists');
      } else {
         throw e;
      }
    }
    return client.end();
  })
  .catch(err => {
    console.error('Error', err.stack);
    return client.end();
  });
