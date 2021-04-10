const config = require("config");

module.exports = {
  image: config.get("ANALYTICS.image"),
  video: config.get("ANALYTICS.video"),
  fusion: config.get("ANALYTICS.fusion")
};
