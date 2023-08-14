const express = require("express");
const app = express();
const port = 3000;
const Client = require("./Client");

app.get("/top-currency-exchangers", async (req, res) => {
  try {
    const results = await Client.getTopExchangeOffices();
    const response = results.map((result) => ({
      country: result.country_code,
      exchanger: result.exchange_office,
      profit: parseFloat(result.total_profit).toFixed(2),
    }));
    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
