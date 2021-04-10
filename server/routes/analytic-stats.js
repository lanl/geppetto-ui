const express = require("express");

const { image, video, fusion } = require("../models/analyticsList");
const pipeline = require("../models/pipeline");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { analytic_stats, fuser_stats } = await pipeline.getAnalyticStats({});

    const imageAnalytics = analytic_stats
      .map(stats => {
        const analytic = image.find(a => a.id === stats.id);

        if (!analytic) {
          return null;
        }

        return {
          ...stats,
          name: analytic.name
        };
      })
      .filter(stats => !!stats);

    const videoAnalytics = analytic_stats
      .map(stats => {
        const analytic = video.find(a => a.id === stats.id);

        if (!analytic) {
          return null;
        }

        return {
          ...stats,
          name: analytic.name
        };
      })
      .filter(stats => !!stats);

    const fusers = fuser_stats.map(stats => {
      const analytic = fusion.find(a => a.id === stats.id);

      if (!analytic) {
        return null;
      }

      return {
        ...stats,
        name: analytic.name
      };
    });

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
