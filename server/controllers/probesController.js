const fs = require("fs-extra");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");
const { Readable } = stream;
const pipeline = promisify(stream.pipeline);

const archiver = require("archiver");
const get = require("lodash.get");

const { Bookmark } = require("../db/models");
const CSVTransform = require("../helpers/CSVTransform");
const Pipeline = require("../models/pipeline");
const fds = require("../services/fds");
const Tags = require("../services/tags");

const {
  applicationInputPath,
  applicationOutputPath,
  thumbnailPath,
  transcodedVideoPath,
  videoSourcesPath
} = require("../helpers/directories");

const { video, image, fusion } = require("../models/analyticsList");
const transformAnalyticList = require("../helpers/analyticListTransformer");

const imageAnalyticsList = transformAnalyticList(image);
const videoAnalyticsList = transformAnalyticList(video);
const fusionAnalyticList = transformAnalyticList(fusion);

const pdfHelper = require("../helpers/pdfHelper");

exports.show = async (req, res, next) => {
  const { id } = req.params;

  const detection = await Pipeline.getDetectionInfo({
    id,
    want_fused: true
  });

  res.json(detection);
};

exports.deleteProbe = async (req, res, next) => {
  const { id } = req.params;

  try {
    const detectionInfo = await Pipeline.getDetectionInfo({ id });

    if (!detectionInfo.tags.type) {
      return res.status(404).end();
    }

    await Pipeline.deleteDetection({ detection_id: id });
    await deleteProbeFiles(detectionInfo);
    await Bookmark.destroy({ where: { probeId: id } });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.deleteProbes = async (req, res, next) => {
  const probeIds = req.body.probeIds || [];

  try {
    for (const id of probeIds) {
      const detectionInfo = await Pipeline.getDetectionInfo({ id });

      if (!detectionInfo.tags.type) {
        continue;
      }

      await Pipeline.deleteDetection({ detection_id: id });
      await deleteProbeFiles(detectionInfo);
      await Bookmark.destroy({ where: { probeId: id } });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.downloadProbeCSV = async (req, res) => {
  const { id } = req.params;

  const detection = await Pipeline.getDetectionInfo({
    id,
    want_fused: true
  });

  res.attachment(`${id}.csv`);
  await pipeline(Readable.from([detection]), new CSVTransform(), res);
};

exports.downloadProbePDF = async (req, res) => {
  const { id } = req.params;

  const detection = await Pipeline.getDetectionInfo({
    id,
    want_fused: true
  });

  downloadPDF(res, req.query.fuser_id, { detections: [detection] });
};

exports.deleteTagged = async (req, res, next) => {
  const deleteTaggedRequest = {};

  if (req.query.tags) {
    deleteTaggedRequest.tags = extractFullTags(req.query.tags);
  }

  Pipeline.getDetectionList(deleteTaggedRequest)
    .then(detectionList => {
      deleteTaggedProbe(res, detectionList);
    })
    .catch(next);
};

exports.extractSortOptions = (req, res, next) => {
  let sortOptions = null;
  let isAsc = false;

  if (req.query.dir && req.query.dir === "1") isAsc = true;

  if (req.query.column && req.query.column === "score") {
    let fuserId = req.query.fuser || req.query.fuser_id || "ta2";
    sortOptions = {
      orderBy: [
        {
          key: 0, // score sort
          is_asc: isAsc
        },
        {
          key: 1, // meta sort
          is_asc: isAsc,
          meta_key: "Hash:md5"
        }
      ],
      fuserId
    };
  } else if (req.query.column) {
    let fuserId = req.query.fuser || req.query.fuser_id || "ta2";
    sortOptions = {
      orderBy: [
        {
          key: 1, // meta sort
          is_asc: isAsc,
          meta_key: req.query.column
        },
        {
          key: 1, // meta sort
          is_asc: isAsc,
          meta_key: "Hash:md5"
        }
      ],
      fuserId
    };
  }

  req.body.sortOptions = sortOptions;

  next();
};

exports.buildListRequest = (req, res, next) => {
  const detectionListRequest = {
    tags: req.query.tags && extractFullTags(req.query.tags),
    exclude_tags: req.query.exclude_tags && extractTags(req.query.exclude_tags),
    meta_query: req.query.meta_query,
    detection_ids: req.query.probe_ids || req.body.probeIds,
    want_fused: true,
    order_by: req.body.sortOptions && req.body.sortOptions.orderBy,
    analytic_id: req.query.analytic_id,
    fuser_id: req.query.fuser_id,
    page_size: req.query.pagesize,
    page_token: req.query.pagetoken
  };

  const hasScoreMin = "score_min" in req.query;
  const hasScoreMax = "score_max" in req.query;

  if (hasScoreMin || hasScoreMax) {
    const scoreMin = hasScoreMin ? parseFloat(req.query.score_min) : 0;
    const scoreMax = hasScoreMax ? parseFloat(req.query.score_max) : 0;

    detectionListRequest.score_filter = {
      has_min: hasScoreMin,
      min: scoreMin,
      has_max: hasScoreMax,
      max: scoreMax
    };
  }

  const hasUploadDateMin = "upload_date_min" in req.query;
  const hasUploadDateMax = "upload_date_max" in req.query;

  if (hasUploadDateMin || hasUploadDateMax) {
    const metaFilters = detectionListRequest.meta_filters || [];

    detectionListRequest.meta_filters = [
      ...metaFilters,
      {
        meta_key: "File:UploadDate",
        has_min: hasUploadDateMin,
        min: req.query.upload_date_min || "",
        has_max: hasUploadDateMax,
        max: req.query.upload_date_max || ""
      }
    ];
  }

  req.detectionListRequest = detectionListRequest;
  next();
};

exports.index = async (req, res) => {
  res.json(await Pipeline.listDetections(req.detectionListRequest));
};

exports.download = async (req, res) => {
  const detections = await getDetections({
    ...req.detectionListRequest,
    view: 1 // FULL
  });

  const archive = archiver("zip");
  const filelist = extractFileList({ detections });
  const analyticDataList = extractAnalyticDataList({ detections }, false);
  const mediaBasePath = "/media";
  const now = new Date();

  res.setHeader("Content-Type", "application/zip");
  res.attachment(
    `medifor_export-${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}.zip`
  );

  archive.on("error", err => {
    throw err;
  });

  archive.pipe(res);

  for (const idx in filelist) {
    archive.file(filelist[idx], {
      name: path.join(
        mediaBasePath,
        analyticDataList[idx][0].probeId,
        path.basename(filelist[idx])
      )
    });

    analyticDataList[idx].forEach(analytic => {
      let maskPath = null;

      if (analytic.maskImagePath) {
        maskPath = addMaskToArchive(
          analytic.maskImagePath,
          // path.basename(filelist[idx]),
          analytic.probeId,
          archive
        );
      }
    });
  }

  archive.finalize();
  return;
};

exports.downloadCSV = async (req, res) => {
  const detections = await getDetectionsWithFusions(req.detectionListRequest);
  res.attachment("index.csv");
  await pipeline(Readable.from(detections), new CSVTransform(), res);
};

exports.downloadJSON = async (req, res) => {
  const detections = await getDetections({
    ...req.detectionListRequest,
    view: 1 // FULL
  });

  res.attachment("index.json");
  res.json(detections);
};

const downloadPDF = (res, fuser, detectionList) => {
  const filelist = extractFileList(detectionList);
  const analyticDataList = extractAnalyticDataList(detectionList, false);
  pdfHelper.createPDF(fuser, filelist, analyticDataList, detectionList, res);
};

const deleteTaggedProbe = (res, detectionDeleteList) => {
  deleteDetectionRequest = {};

  detectionDeleteList.detections.forEach(detection => {
    deleteDetectionRequest.detection_id = detection.meta["Hash:md5"];
    Pipeline.deleteDetection(deleteDetectionRequest).then(response => {
      res.send("Probe Deleted");
    });
  });
};

const addMaskToArchive = (maskPath, probeId, archive) => {
  const basePath = maskPath.split(path.sep).slice(-3);
  const analyticId = basePath[0];
  const ext = path.extname(basePath[2]);
  const sourceMaskPath = path.join(applicationOutputPath, ...basePath);

  // /media/{probeid}/masks/{analytic_id}.{ext}
  const archiveMaskPath = path.join(
    "media",
    path.parse(probeId).name,
    "masks",
    `${analyticId}${ext}`
  );

  archive.file(sourceMaskPath, { name: archiveMaskPath });
  return archiveMaskPath;
};

const extractFileList = detectionList => {
  let base;
  let dir;

  return detectionList.detections.map(detection => {
    const analyticInfo = detection.analytic_info[0];

    if (analyticInfo.detection.img_manip_req) {
      base = path.basename(analyticInfo.detection.img_manip_req.image.uri);
      dir = applicationInputPath;
    } else if (analyticInfo.detection.vid_manip_req) {
      base = path.basename(analyticInfo.detection.vid_manip_req.video.uri);
      dir = videoSourcesPath;
    }

    return path.format({ dir, base });
  });
};

const extractAnalyticDataList = (detectionList, wantFusers) => {
  const targets = {
    image: {
      manipulationProp: "img_manip",
      analyticsList: imageAnalyticsList,
      fusionList: fusionAnalyticList
    },
    video: {
      manipulationProp: "vid_manip",
      analyticsList: videoAnalyticsList,
      fusionList: fusionAnalyticList
    }
  };

  // each probe
  const analytics = detectionList.detections.map(detection => {
    const target = targets[detection.tags.type];

    return detection.analytic_info.map(info => ({
      originalFileName: detection.meta["File:FileName"],
      stage: info.stage,
      status: info.status,

      probeId: detection.id,
      analyticID: info.analytic_id,
      friendlyName:
        (target.analyticsList[info.analytic_id] &&
          target.analyticsList[info.analytic_id].name) ||
        "",
      description:
        (target.analyticsList[info.analytic_id] &&
          target.analyticsList[info.analytic_id].description) ||
        "",
      integrityScore:
        (info.detection[target.manipulationProp] &&
          info.detection[target.manipulationProp].score) ||
        -1,
      maskImagePath: get(
        info.detection[target.manipulationProp],
        "localization.mask.uri"
      ),
      tags: Object.keys(detection.user_tags)
        .sort()
        .join(", ")
    }));
  });
  //Only want fusers on a CSV download if it is for a single probe
  if (!wantFusers) return analytics;
  //each probe -- each fusion model ran on probe
  const fusers = detectionList.detections.map(detection => {
    const target = targets[detection.tags.type];

    return detection.fusion_info.map(info => ({
      originalFileName: detection.meta["File:FileName"],
      stage: info.stage,
      status: info.status,

      probeId: detection.id,
      analyticID: info.fuser_id,
      friendlyName:
        (target.fusionList[info.fuser_id] &&
          target.fusionList[info.fuser_id].name) ||
        "",
      description:
        (target.fusionList[info.fuser_id] &&
          target.fusionList[info.fuser_id].description) ||
        "",
      integrityScore:
        (info.fusion[target.manipulationProp] &&
          info.fusion[target.manipulationProp].score) ||
        -1,
      maskImagePath: get(
        info.fusion[target.manipulationProp],
        "localization.mask.uri"
      ),
      tags: Object.keys(detection.user_tags)
        .sort()
        .join(", ")
    }));
  });

  return [[...analytics[0], ...fusers[0]]];
};

const extractFullTags = tagList => {
  const tags = {};
  tagList.split(",").forEach(t => {
    let [k, v] = t.split("=");
    tags[k.toLowerCase()] = v;
  });
  return tags;
};

const extractTags = tagList => {
  const tags = {};
  tagList.split(",").forEach(t => (tags[t.toLowerCase()] = null));
  return tags;
};

async function getDetections(request) {
  let detections = [];
  let pageToken = "";

  for (;;) {
    const response = await Pipeline.getDetectionList({
      ...request,
      page_token: pageToken
    });

    detections = detections.concat(response.detections);
    pageToken = response.page_token;

    if (!pageToken) {
      break;
    }
  }

  return detections;
}

async function* getDetectionsWithFusions(request) {
  const detections = await getDetections(request);

  for (const detection of detections) {
    yield await Pipeline.getDetectionInfo({
      id: detection.id,
      want_fused: true
    });
  }
}

async function replaceTags(req, res, next) {
  const detectionId = req.params.id;
  let tags = {};

  if (req.body.tags) {
    tags = extractTags(req.body.tags);
  }

  const detectionInfo = await Tags.updateDetectionTags(detectionId, true, tags);
  res.json(detectionInfo);
}

async function mergeTags(req, res, next) {
  const detectionId = req.params.id;
  let tags = {};

  if (req.body.tags) {
    tags = extractTags(req.body.tags);
  }

  const detectionInfo = await Tags.updateDetectionTags(
    detectionId,
    false,
    tags
  );
  res.json(detectionInfo);
}

async function deleteTags(req, res, next) {
  const detectionId = req.params.id;
  const tags = {};
  let tagsToDelete = [];

  if (req.body.tags) {
    tagsToDelete = req.body.tags.split(",").map(t => t.toLowerCase());
  }

  // Replace must be false for delete to work
  const detectionInfo = await Tags.updateDetectionTags(
    detectionId,
    false,
    tags,
    tagsToDelete
  );
  res.json(detectionInfo);
}
exports.tags = {
  replace: replaceTags,
  merge: mergeTags,
  delete: deleteTags
};

exports.updateProbesTags = async (req, res, next) => {
  const probeIds = req.body.probeIds || [];
  const tagsToAdd = req.body.tagsToAdd || [];
  const tagsToRemove = req.body.tagsToRemove || [];

  try {
    for (const id of probeIds) {
      await Tags.updateDetectionTags(
        id,
        false,
        Object.fromEntries(tagsToAdd.map(tag => [tag, null])),
        tagsToRemove
      );
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.updateMetadata = async (req, res, next) => {
  const detectionInfo = await Pipeline.updateDetectionMetadata(
    req.params.id,
    req.body
  );

  res.json(detectionInfo);
};

exports.deleteFailedAnalytics = async (req, res, next) => {
  try {
    if (fds) {
      await fds.deleteFailedTasks();
    }

    res.json(await Pipeline.deleteFailedAnalytics({}));
  } catch (err) {
    next(err);
  }
};

async function deleteProbeFiles({ id, analytic_info, meta }) {
  const name = meta["Hash:md5"];
  const ext = "." + meta["File:FileTypeExtension"];

  const file = path.format({ dir: applicationInputPath, name, ext });
  const thumbnailFile = path.format({ dir: thumbnailPath, name, ext: ".jpg" });
  const transcodedVideoFile = path.format({
    dir: transcodedVideoPath,
    name,
    ext: ".mp4"
  });

  await fs.remove(file);
  await fs.remove(thumbnailFile);
  await fs.remove(transcodedVideoFile);

  for (const { analytic_id } of analytic_info) {
    const outDir = path.join(applicationOutputPath, analytic_id, id);
    await fs.remove(outDir);
  }
}
