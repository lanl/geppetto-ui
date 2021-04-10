const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");
const probesController = require("../controllers/probesController");
const tagsController = require("../controllers/tagsController");
const uploadsController = require("../controllers/uploadsController");
const userController = require("../controllers/userController");
const facetsController = require("../controllers/facetsController");

const { catchErrors } = require("../handlers/errorHandlers");

router.get("/analytics", catchErrors(analyticsController.index));

router.get("/facets", catchErrors(facetsController.index));

router.get(
  "/probes/",
  probesController.extractSortOptions,
  probesController.buildListRequest,
  catchErrors(probesController.index)
);
router.get(
  "/probes/download",
  probesController.extractSortOptions,
  probesController.buildListRequest,
  catchErrors(probesController.download)
);
router.post(
  "/probes/download",
  probesController.extractSortOptions,
  probesController.buildListRequest,
  catchErrors(probesController.download)
);
router.get(
  "/probes/csv",
  probesController.extractSortOptions,
  probesController.buildListRequest,
  catchErrors(probesController.downloadCSV)
);
router.get(
  "/probes/json",
  probesController.extractSortOptions,
  probesController.buildListRequest,
  catchErrors(probesController.downloadJSON)
);

router.get("/probes/:id", catchErrors(probesController.show));
router.get("/probes/:id/csv", catchErrors(probesController.downloadProbeCSV));
router.get("/probes/:id/pdf", catchErrors(probesController.downloadProbePDF));

router.delete(
  "/probes/failed-analytics",
  probesController.deleteFailedAnalytics
);

router.delete("/probes/:id", catchErrors(probesController.deleteProbe));
router.delete("/probes/", catchErrors(probesController.deleteProbes));

router.patch(
  "/probes/:id/metadata",
  catchErrors(probesController.updateMetadata)
);

router.post(
  "/probes/:id/rerun",
  catchErrors(uploadsController.rerunAnalytics),
  catchErrors(uploadsController.submitDetection)
);

router.put("/probes/:id/tags", catchErrors(probesController.tags.replace));
router.patch("/probes/:id/tags", catchErrors(probesController.tags.merge));
router.delete("/probes/:id/tags", catchErrors(probesController.tags.delete));
router.patch("/probes/tags", probesController.updateProbesTags);

router.get("/tags", catchErrors(tagsController.index));

router.post(
  "/upload",
  uploadsController.upload,
  catchErrors(uploadsController.prepfile),
  catchErrors(uploadsController.preprocess),
  catchErrors(uploadsController.s3Upload),
  catchErrors(uploadsController.transcodeVideo),
  uploadsController.extractTags,
  catchErrors(uploadsController.createImageRequest),
  catchErrors(uploadsController.createVideoRequest),
  catchErrors(uploadsController.submitDetection)
);

router.post(
  "/uploadURL",
  catchErrors(uploadsController.fromURL),
  catchErrors(uploadsController.prepfile),
  catchErrors(uploadsController.preprocess),
  catchErrors(uploadsController.s3Upload),
  catchErrors(uploadsController.transcodeVideo),
  uploadsController.extractTags,
  catchErrors(uploadsController.createImageRequest),
  catchErrors(uploadsController.createVideoRequest),
  catchErrors(uploadsController.submitDetection)
);

router.get("/user", userController.show);

router.use("/", require("./bookmarks"));
router.use("/", require("./fuse"));
router.use("/analytic-stats", require("./analytic-stats"));
router.use("/analytics", require("./analytics"));
router.use("/histogram", require("./histogram"));

module.exports = router;
