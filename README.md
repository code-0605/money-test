## Setup the project

`npm i`

### update postgresql details in db.js

### create table with the following schema

```sql
CREATE TABLE exchange_office (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country_code CHAR(3)
);

CREATE TABLE exchange (
  id SERIAL PRIMARY KEY,
  exchange_office_id INT REFERENCES exchange_office(id),
  from_currency CHAR(3),
  to_currency CHAR(3),
  ask NUMERIC(10, 2),
  date TIMESTAMP
);

CREATE TABLE rate (
  id SERIAL PRIMARY KEY,
  exchange_office_id INT REFERENCES exchange_office(id),
  from_currency CHAR(3),
  to_currency CHAR(3),
  in_rate NUMERIC(10, 2),
  out_rate NUMERIC(10, 2),
  reserve NUMERIC(15, 2),
  date TIMESTAMP
);

CREATE TABLE country (
  code CHAR(3) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
```

### insert test data from data.txt file

`node insertData.js data.txt`

### run the project

`node api.js`

### API URL

`http://localhost:3000/top-currency-exchangers`

## Answers to the questions

### How to change the code to support different file format versions?

To change the code to support different file format versions, we will need to determine the differences between the files first. As I have created a Parser.js file with the parsing logic, I can create a new method inside the Parser class to support the new versions accordingly. As for the logic to determine the version of the file, It depends on the context but I would probably use the file extension to determine the version of the file.

### How will the import system change if in the future we need to get this data from a web API?

If we need to get the data from a web API, we will just have to use fetch or axios to get data from the API and pass the data to the parseLinesv1 function inside the Parser class to parse the data. The rest of the code will remain the same.

### If in the future it will be necessary to do the calculations using the national bank rate, how could this be added to the system?

If we need to do the calculations using the national bank rate, we will need to add a new table to store the national bank rate to prevent the need to fetch the data from the API every time we need to do the calculations. Then, we will have to edit the query in the getTopExchangeOffices function inside the Client class to use the national bank rate instead of the exchange rate from the exchange table.

### How would it be possible to speed up the execution of requests if the task allowed you to update market data once a day or even less frequently?

If the task allowed me to update market data once a day or even less frequently, I would use a cron job to update the data once a day or less frequently. Then, I would store the data in a cache to speed up the execution of requests. If the data is updated once a day, I would set the cache to expire after 24 hours. If the data is updated less frequently, I would set the cache to expire after the data is updated.
