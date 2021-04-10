const config = require("config");

module.exports = {
  development: {
    database: config.get("POSTGRES_DB"),
    username: config.get("POSTGRES_USER"),
    password: config.get("POSTGRES_PASSWORD"),
    host: config.get("POSTGRES_HOST"),
    port: config.get("POSTGRES_PORT"),
    dialect: "postgres",
    logging: false
  },
  production: {
    database: config.get("POSTGRES_DB"),
    username: config.get("POSTGRES_USER"),
    password: config.get("POSTGRES_PASSWORD"),
    host: config.get("POSTGRES_HOST"),
    port: config.get("POSTGRES_PORT"),
    dialect: "postgres",
    logging: false
  }
};
