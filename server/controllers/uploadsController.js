const fs = require("fs-extra");
const request = require("request");
const path = require("path");
const util = require("util");

const S3 = require("aws-sdk/clients/s3");
const config = require("config");
const exiftool = require("exiftool-vendored").exiftool;
const hasha = require("hasha");
const multer = require("multer");
const sharp = require("sharp");

const ffmpeg = require("fluent-ffmpeg");
const ffprobe = util.promisify(ffmpeg.ffprobe);

const Pipeline = require("../models/pipeline");
const screenshot = require("../helpers/screenshot");
const transcode = require("../helpers/transcode");
const { parseBoolean } = require("../helpers/util");

const {
  applicationInputPath,
  applicationOutputPath,
  containerInputPath,
  containerOutputPath,
  thumbnailPath,
  inboxPath,
  videoSourcesPath,
  transcodedVideoPath
} = require("../helpers/directories");

const {
  video: videoAnalytics,
  image: imageAnalytics
} = require("../models/analyticsList");

const multerOptions = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, inboxPath);
    },
    filename(req, file, cb) {
      cb(null, file.originalname);
    }
  }),
  fileFilter(req, file, cb) {
    const isAccepted =
      file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (isAccepted) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

exports.upload = multer(multerOptions).single("probe");

exports.fromURL = async (req, res, next) => {
  if (req.body.uploadUrl !== undefined || req.body.uploadUrl !== "") {
    const probeFilename = encodeURIComponent(
      req.body.uploadUrl.split("/").pop()
    );
    req.file = {
      fieldname: "probe",
      originalname: probeFilename,
      destination: inboxPath,
      path: inboxPath + "/" + probeFilename
    };

    var ws = fs.createWriteStream(req.file.path, "base64");
    request
      .get({ uri: req.body.uploadUrl, encoding: null })
      .on("response", function(response) {
        req.file.mimetype = response.headers["content-type"];
        req.file.size = response.headers["content-length"];
        req.file.encoding = response.headers["content-encoding"];
      })
      .pipe(ws)
      .on("close", function() {
        req.encoding = "base64"; //not really sure

        next();
      });
  } else {
    // this probably isn't correct
    res.status(400).json({ msg: "Invalid Path" });
    next();
  }
};

exports.prepfile = async (req, res, next) => {
  const file = req.file;
  const [mimetype, mimeSubtype] = file.mimetype.split("/");
  const extname = path.extname(file.originalname);

  const probeFilename =
    (await hasha.fromFile(file.path, { algorithm: "md5" })) + extname;
  //file.originalName.split(".")[0] + extname;

  req.body.probe = {
    destination: applicationInputPath,
    filename: probeFilename,
    originalname: file.originalname.split(".")[0] + extname,
    path: path.join(applicationInputPath, probeFilename),
    mimetype: file.mimetype,
    isImage: (() => (mimetype === "image" ? true : false))(),
    isVideo: (() => (mimetype === "video" ? true : false))(),
    mime: {
      type: mimetype,
      subtype: mimeSubtype
    }
  };

  if (req.body.probe.isImage) {
    req.body.probe.path = path.join(applicationInputPath, probeFilename);
  }

  if (req.body.probe.isVideo) {
    // Move the file to video sources for analytics to process
    req.body.probe.path = path.join(applicationInputPath, probeFilename);
  }

  await fs.move(file.path, req.body.probe.path, { overwrite: true });
  next();
};

exports.preprocess = async (req, res, next) => {
  const detectionRequest = {};
  const probe = req.body.probe;

  const hashes = await getHashes(probe.path);

  // get hashes
  const hashKeys = Object.keys(hashes);
  const taggedHashes = {};
  hashKeys.forEach(k => (taggedHashes[`Hash:${k}`] = hashes[k]));

  // get exif data
  const exifData = await exiftool.read(probe.path, ["-G", "-s"]);

  // delete blacklisted
  const keyBlacklist = [
    "SourceFile",
    "File:FileModifyDate",
    "File:FileAccessDate",
    "File:FileInodeChangeDate",
    "File:Directory",
    "File:FilePermissions",
    "errors"
  ];

  for (const key of keyBlacklist) {
    delete exifData[key];
  }

  // setup detectionrequest
  detectionRequest.id = hashes["md5"];
  detectionRequest.user_tags = {};
  detectionRequest.tags = { type: probe.mime.type };
  detectionRequest.meta = {
    ...taggedHashes,
    ...exifData,
    "File:FileName": probe.originalname,
    "File:UploadDate": new Date().toISOString()
  };
  detectionRequest.request = {};

  req.body.detectionRequest = detectionRequest;
  next();
};

exports.transcodeVideo = async (req, res, next) => {
  const { detectionRequest, probe } = req.body;

  if (probe.isVideo) {
    try {
      const metadata = await ffprobe(probe.path);
      const video = metadata.streams.find(
        stream => stream.codec_type === "video"
      );

      if (!video) {
        throw new Error("File does not contain a video stream");
      }

      detectionRequest.meta["File:Frames"] = video.nb_frames;

      const { name } = path.parse(probe.path);
      const outputFile = path.format({
        dir: transcodedVideoPath,
        name,
        ext: ".mp4"
      });

      if (video.codec_name === "h264" && video.pix_fmt === "yuv420p") {
        await fs.copyFile(probe.path, outputFile);
        console.log(`Copied file: ${outputFile}`);
      } else {
        await transcode(probe.path, outputFile);
        console.log(`Transcoded video: ${outputFile}`);
      }
    } catch (err) {
      res.status(400).end();
      return;
    }
  }

  next();
};

exports.extractTags = (req, res, next) => {
  const detectionRequest = req.body.detectionRequest;
  if (req.body.tagArr) {
    req.body.tagArr.forEach(
      t => (detectionRequest.user_tags[t.toLowerCase()] = null)
    );
  } else if (req.body.tags) {
    req.body.tags
      .split(",")
      .forEach(t => (detectionRequest.user_tags[t.toLowerCase()] = null));
  }
  next();
};

exports.createImageRequest = async (req, res, next) => {
  if (req.body.probe.isImage) {
    const requestId = req.body.detectionRequest.id;
    const probe = req.body.probe;

    req.body.detectionRequest.request = {
      img_manip_req: {
        request_id: requestId,
        image: {
          uri: path.posix.join(containerInputPath, probe.filename),
          type: probe.mimetype
        },
        out_dir: containerOutputPath
      }
    };

    await createOutputDirs(requestId, imageAnalytics);

    const dest = path.format({
      dir: thumbnailPath,
      name: path.parse(probe.filename).name,
      ext: ".jpg"
    });

    await thumbnailify(probe.path, dest);
  }
  next();
};

exports.createVideoRequest = async (req, res, next) => {
  if (req.body.probe.isVideo) {
    const requestId = req.body.detectionRequest.id;
    const probe = req.body.probe;

    req.body.detectionRequest.request = {
      vid_manip_req: {
        request_id: requestId,
        video: {
          uri: path.posix.join(containerInputPath, probe.filename),
          type: probe.mimetype
        },
        out_dir: containerOutputPath
      }
    };

    await createOutputDirs(requestId, videoAnalytics);
    await screenshot(probe.path, path.join(thumbnailPath, probe.filename));
  }

  next();
};

exports.rerunAnalytics = async (req, res, next) => {
  const { id } = req.params;
  const detectionInfo = await Pipeline.getDetectionInfo({ id });

  const isImage = detectionInfo.tags.type === "image";
  const isVideo = detectionInfo.tags.type === "video";

  if (isImage) {
    const { img_manip_req } = detectionInfo.analytic_info[0].detection;

    req.body.detectionRequest = {
      id,
      request: {
        img_manip_req
      }
    };

    await createOutputDirs(img_manip_req.request_id, imageAnalytics);
  }

  if (isVideo) {
    const { vid_manip_req } = detectionInfo.analytic_info[0].detection;

    req.body.detectionRequest = {
      id,
      request: {
        vid_manip_req
      }
    };

    await createOutputDirs(vid_manip_req.request_id, videoAnalytics);
  }

  req.body.probe = {
    isImage,
    isVideo
  };

  next();
};

exports.submitDetection = async (req, res, next) => {
  let detection;

  if (req.body.probe.isImage) {
    detection = await Pipeline.detectImage(req.body.detectionRequest);
  } else if (req.body.probe.isVideo) {
    detection = await Pipeline.detectVideo(req.body.detectionRequest);
  } else {
    next();
  }
  res.status(201).json(detection);
  next();
};

async function createOutputDirs(requestId, analytics) {
  if (!parseBoolean(config.get("CREATE_OUTPUT_DIRS"))) {
    return;
  }

  for (analytic of analytics) {
    const p = path.join(applicationOutputPath, analytic.id, requestId);

    try {
      await fs.mkdir(p, { recursive: true });
    } catch (err) {
      console.error(`Could not create output directory: ${p}`, err);
    }
  }
}

async function thumbnailify(sourcePath, destinationPath) {
  return sharp(sourcePath)
    .resize({ height: 150 })
    .toFile(destinationPath);
}

async function getHashes(filePath) {
  const hashes = {};
  const algorithms = ["md5", "sha1", "sha256", "sha512"];

  for (const algorithm of algorithms) {
    hashes[algorithm] = await hasha.fromFile(filePath, { algorithm });
  }

  return hashes;
}

function connectS3() {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    return null;
  }

  return new S3({
    apiVersion: "2006-03-01",
    httpOptions: {
      proxy: process.env.http_proxy
    },
    params: {
      Bucket: bucketName
    }
  });
}

const s3 = connectS3();

exports.s3Upload = async (req, res, next) => {
  const probe = req.body.probe;

  if (s3) {
    const params = {
      Key: path.posix.join("input", probe.filename),
      Body: fs.createReadStream(probe.path)
    };

    const data = await s3.upload(params).promise();
    console.log("Uploaded file to S3:", data.Location);
  }

  next();
};
