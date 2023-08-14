const { pool } = require("./db");

class Client {
  static async insertData(data) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Insert countries (making sure to avoid duplicates)
      const countryCodes = new Set();
      for (const office of data["exchange-offices"]) {
        if (office.country && !countryCodes.has(office.country)) {
          await client.query(
            "INSERT INTO country(code, name) VALUES($1, $2) ON CONFLICT (code) DO NOTHING",
            [office.country, office.country] // You might want to provide a proper name here
          );
          countryCodes.add(office.country);
        }
      }

      // Insert exchange offices, exchanges, and rates
      for (const office of data["exchange-offices"]) {
        const exchangeOffice = await client.query(
          "INSERT INTO exchange_office(name, country_code) VALUES($1, $2) RETURNING id",
          [office.name, office.country]
        );

        for (const exchange of office.exchanges || []) {
          await client.query(
            "INSERT INTO exchange(exchange_office_id, from_currency, to_currency, ask, date) VALUES($1, $2, $3, $4, $5)",
            [
              exchangeOffice.rows[0].id,
              exchange.from,
              exchange.to,
              exchange.ask,
              exchange.date,
            ]
          );
        }

        for (const rate of office.rates || []) {
          await client.query(
            "INSERT INTO rate(exchange_office_id, from_currency, to_currency, in_rate, out_rate, reserve, date) VALUES($1, $2, $3, $4, $5, $6, $7)",
            [
              exchangeOffice.rows[0].id,
              rate.from,
              rate.to,
              rate.in,
              rate.out,
              rate.reserve,
              rate.date,
            ]
          );
        }
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  static async getTopExchangeOffices() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `WITH CurrencyPairProfit AS (
          SELECT eo.country_code, eo.name AS exchange_office, ex.from_currency, ex.to_currency,
            SUM(
              CASE
                WHEN ex.from_currency = 'USD' THEN ex.ask
                WHEN ex.from_currency != 'USD' THEN ex.ask / r.in_rate
                ELSE 0
              END
              -
              CASE
                WHEN ex.to_currency = 'USD' THEN ex.ask
                WHEN ex.to_currency != 'USD' THEN ex.ask / r.out_rate
                ELSE 0
              END
            ) AS profit
          FROM exchange_office eo
          JOIN exchange ex ON ex.exchange_office_id = eo.id
          JOIN rate r ON r.exchange_office_id = eo.id
            AND r.from_currency = ex.from_currency
            AND r.to_currency = ex.to_currency
          GROUP BY eo.country_code, eo.name, ex.from_currency, ex.to_currency
        ),
        ExchangerProfit AS (
          SELECT country_code, exchange_office, SUM(profit) AS total_profit
          FROM CurrencyPairProfit
          GROUP BY country_code, exchange_office
        ),
        CountryProfit AS (
          SELECT country_code, SUM(total_profit) AS country_total_profit
          FROM ExchangerProfit
          GROUP BY country_code
        ),
        Top3Countries AS (
          SELECT country_code
          FROM CountryProfit
          ORDER BY country_total_profit DESC
          LIMIT 3
        )
        SELECT e.country_code, e.exchange_office, e.total_profit
        FROM ExchangerProfit e
        JOIN Top3Countries t ON t.country_code = e.country_code
        ORDER BY e.country_code, e.total_profit DESC
        LIMIT 3;        
      `
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}
module.exports = Client;
