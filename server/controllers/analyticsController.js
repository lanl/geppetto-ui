const {
  video: videoAnalytics,
  image: imageAnalytics,
  fusion: fusers
} = require("../models/analyticsList");

exports.index = async function(req, res, next) {
  res.json({ imageAnalytics, videoAnalytics, fusers });
};
