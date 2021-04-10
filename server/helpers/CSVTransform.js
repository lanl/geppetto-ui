const { Transform } = require("json2csv");
const { fusion, image, video } = require("../models/analyticsList");

function extractScore(detectionInfo, type) {
  if (!detectionInfo) {
    return null;
  }

  const detection = detectionInfo.detection || detectionInfo.fusion;

  if (!detection || (detection.status && detection.status.code !== 0)) {
    return null;
  }

  switch (type) {
    case "image":
      const { img_manip } = detection;

      if (!img_manip || img_manip.opt_out === 1 || img_manip.opt_out === 2) {
        return null;
      }

      return (1 - img_manip.score) * 100;

    case "video":
      const { vid_manip } = detection;

      if (!vid_manip || vid_manip.opt_out.includes(0)) {
        return null;
      }

      return (1 - vid_manip.score) * 100;
  }

  return null;
}

const opts = {
  fields: [
    {
      label: "File Name",
      value: probe => probe.meta["File:FileName"]
    },
    {
      label: "Title",
      value: probe => probe.meta["File:Title"]
    },
    {
      label: "Upload Date",
      value: probe => probe.meta["File:UploadDate"]
    },
    {
      label: "MD5",
      value: probe => probe.meta["Hash:md5"]
    },
    {
      label: "SHA-1",
      value: probe => probe.meta["Hash:sha1"]
    },
    {
      label: "SHA-256",
      value: probe => probe.meta["Hash:sha256"]
    },
    {
      label: "SHA-512",
      value: probe => probe.meta["Hash:sha512"]
    },
    {
      label: "MIME Type",
      value: probe => probe.meta["File:MIMEType"]
    },
    {
      label: "Tags",
      value: probe =>
        Object.keys(probe.user_tags)
          .sort()
          .join(", ")
    },
    ...fusion.map(fusion => ({
      label: `Fusion - ${fusion.name} (${fusion.id})`,
      value: probe =>
        extractScore(
          probe.fusion_info.find(f => f.fuser_id === fusion.id),
          probe.tags.type
        )
    })),
    ...image.map(analytic => ({
      label: `${analytic.name} (${analytic.id})`,
      value: probe =>
        extractScore(
          probe.analytic_info.find(a => a.analytic_id === analytic.id),
          probe.tags.type
        )
    })),
    ...video.map(analytic => ({
      label: `${analytic.name} (${analytic.id})`,
      value: probe =>
        extractScore(
          probe.analytic_info.find(a => a.analytic_id === analytic.id),
          probe.tags.type
        )
    }))
  ]
};

const transformOpts = {
  objectMode: true
};

class CSVTransform extends Transform {
  constructor() {
    super(opts, transformOpts);
  }
}

module.exports = CSVTransform;
