const { neon } = require('@neondatabase/serverless');

function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

let queryClient = null;

function getClient() {
  if (!queryClient) {
    const connStr = getConnectionString();
    if (!connStr) {
      throw new Error(
        'Database connection string not configured. Please set POSTGRES_URL or DATABASE_URL.'
      );
    }
    // fullResults: true returns { rows, fields, rowCount, ... } matching @vercel/postgres
    queryClient = neon(connStr, { fullResults: true });
  }
  return queryClient;
}

// sql tag function that passes through tagged template literals to neon
const sql = (strings, ...values) => {
  const client = getClient();
  return client(strings, ...values);
};

module.exports = { sql, getClient };
