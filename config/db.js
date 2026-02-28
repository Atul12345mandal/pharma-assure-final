const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pharmadb",   // make sure this is your DB name
  password: "",           // empty because you enabled trust mode
  port: 5432,
});

module.exports = pool;