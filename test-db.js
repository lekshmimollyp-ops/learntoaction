const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5432/learntoaction',
});
client.connect()
  .then(() => {
    console.log('Connected successfully');
    return client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    return client.end();
  });
