const express = require("express");

const { parseTags, parseTagNames } = require("../helpers/util");
const { image, video, fusion } = require("../models/analyticsList");
const pipeline = require("../models/pipeline");

const router = express.Router();

router.get("/with-scores", async (req, res, next) => {
  const { tags, exclude_tags } = req.query;

  try {
    const { analytic_ids, fuser_ids } = await pipeline.getAnalyticsWithScores({
      tags: parseTags(tags),
      exclude_tags: parseTagNames(exclude_tags)
    });

    const imageAnalytics = analytic_ids
      .map(analyticId => image.find(a => a.id === analyticId))
      .filter(analytic => !!analytic);

    const videoAnalytics = analytic_ids
      .map(analyticId => video.find(a => a.id === analyticId))
      .filter(analytic => !!analytic);

    const fusers = fuser_ids
      .map(fuserId => fusion.find(f => f.id === fuserId))
      .filter(fuser => !!fuser);

    res.json({
      imageAnalytics,
      videoAnalytics,
      fusers
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
