const express = require("express");

const { parseTags, parseTagNames } = require("../helpers/util");
const pipeline = require("../models/pipeline");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { analytic_id, fuser_id, tags, exclude_tags } = req.query;

  try {
    res.json(
      await pipeline.getHistogram({
        analytic_id,
        fuser_id,
        tags: parseTags(tags),
        exclude_tags: parseTagNames(exclude_tags)
      })
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
