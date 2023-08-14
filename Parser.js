class Parser {
  static parseLinesv1(content) {
    const lines = content.trim().split("\n");
    const result = { "exchange-offices": [] };
    let currentExchangeOffice;
    let currentSection;
    let currentObject;

    lines.forEach((line) => {
      const indent = line.search(/\S/);
      const [key, value] = line.trim().split(" = ");

      switch (indent) {
        case 0:
          if (key === "exchange-office") {
            currentExchangeOffice = {};
            result["exchange-offices"].push(currentExchangeOffice);
            currentSection = null;
          }
          break;
        case 2:
          if (key === "exchanges" || key === "rates") {
            currentSection = key;
            currentExchangeOffice[key] = [];
          } else {
            currentExchangeOffice[key] = value;
          }
          break;
        case 4:
          if (key === "exchange" || key === "rate") {
            currentObject = {};
            currentExchangeOffice[currentSection].push(currentObject);
          } else if (currentSection) {
            currentExchangeOffice[currentSection][
              currentExchangeOffice[currentSection].length - 1
            ][key] = value;
          }
          break;
        case 6:
          if (currentObject) {
            currentObject[key] = value;
          }
          break;
      }
    });

    return result;
  }
}

module.exports = Parser;
