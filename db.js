const { Pool } = require("pg");

const pool = new Pool({
  user: "pguser02",
  host: process.env.HOST,
  database: "pguser02",
  password: "pguser02",
});

module.exports = { pool };
