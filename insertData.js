const Parser = require("./Parser");
const Client = require("./Client");
const fs = require("fs");
const pathArg = process.argv[2];
// Check if path to data file is provided
if (!pathArg) {
  console.error("Path to data file is required.");
  process.exit(1);
}

// Check if file exists
const path = pathArg.trim();
if (!fs.existsSync(path)) {
  console.error(`File ${path} does not exist.`);
  process.exit(1);
}

const data = fs.readFileSync(path, "utf8");
const parsedData = Parser.parseLinesv1(data);

// Insert data
Client.insertData(parsedData)
  .then(() => {
    console.log("Data inserted successfully.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
