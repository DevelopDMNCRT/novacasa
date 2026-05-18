const { Pool, types } = require('pg');
require('dotenv').config();

// Enforce pg driver to parse TIMESTAMP WITHOUT TIME ZONE (OID 1114) as UTC
types.setTypeParser(1114, function(stringValue) {
  return new Date(stringValue.replace(' ', 'T') + 'Z');
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper for single queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
