const Tags = require("../services/tags");

exports.index = async (req, res, next) => {
  const detectionTagInfo = await Tags.getDetectionTagInfo();
  res.json(detectionTagInfo);
};
