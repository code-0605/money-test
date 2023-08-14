const { pool } = require("./db");
// test connection
async function testConn() {
  const client = await pool.connect();
  console.log("Connection to DB successful.");
  await client.end();
}
testConn();
