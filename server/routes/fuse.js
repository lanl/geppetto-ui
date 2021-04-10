const express = require("express");

const { containerOutputPath } = require("../helpers/directories");
const { fusion: fusers } = require("../models/analyticsList");
const pipeline = require("../models/pipeline");

const router = express.Router();

router.post("/fuse", (req, res, next) => {
  pipeline
    .fuseAllIDs({
      fuser_id: fusers.map(fuser => fuser.id),
      out_dir: containerOutputPath
    })
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
});

module.exports = router;
