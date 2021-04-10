const config = require("config");

module.exports = {
  facets: config.get("FACETS")
};
