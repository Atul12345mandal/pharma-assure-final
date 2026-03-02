const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "pharmacomply360",
    password: "", // keep empty if no password
    port: 5432,
});

// Alternative if you want to use DB_URL from .env:
// const pool = new Pool({
//     connectionString: process.env.DB_URL,
// });

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error connecting to database:', err.stack);
    }
    console.log('✅ Connected to database successfully');
    release();
});

module.exports = pool;