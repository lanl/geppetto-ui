const path = require("path");
const fs = require("fs");
const util = require("util");

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const config = require("config");
const {
  containerInputPath,
  containerOutputPath,
  applicationInputPath,
  protosRoot
} = require("../helpers/directories");

const {
  video: videoAnalytics,
  image: imageAnalytics,
  fusion: fusers
} = require("./analyticsList");

const fusersFor = type =>
  fusers.filter(fuser => fuser.handles.includes(type)).map(fuser => fuser.id);

function detect(request) {
  return new Promise((resolve, reject) => {
    workflowClient.Detect(request, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
}

exports.detectImage = detectionRequest => {
  detectionRequest.analytic_id = imageAnalytics.map(a => a.id);
  detectionRequest.fuser_id = fusersFor("image");

  return detect(detectionRequest)
    .then(response => {
      return response;
    })
    .catch(err => {
      throw err;
    });
};

exports.detectVideo = detectionRequest => {
  detectionRequest.analytic_id = videoAnalytics.map(a => a.id);
  detectionRequest.fuser_id = fusersFor("video");

  return detect(detectionRequest)
    .then(response => {
      return response;
    })
    .catch(err => {
      throw err;
    });
};

exports.getDetectionInfo = detectionInfoRequest => {
  return new Promise((resolve, reject) => {
    workflowClient.GetDetectionInfo(detectionInfoRequest, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
};

exports.getDetectionList = detectionListRequest => {
  return new Promise((resolve, reject) => {
    workflowClient.GetDetectionList(detectionListRequest, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
};

exports.deleteDetection = deleteDetectionRequest => {
  return new Promise((resolve, reject) => {
    workflowClient.DeleteDetection(deleteDetectionRequest, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
};

exports.updateDetectionMetadata = (detectionId, metadata) => {
  const request = {
    detection_id: detectionId,
    metadata
  };

  return new Promise((resolve, reject) => {
    workflowClient.UpdateDetectionMetadata(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

const init = () => {
  const pipelineDefinition = protoLoader.loadSync("medifor/v1/pipeline.proto", {
    keepCase: true,
    defaults: true,
    includeDirs: [protosRoot]
  });

  const mediforProto = grpc.loadPackageDefinition(pipelineDefinition).mediforproto;

  const host = config.get("WORKFLOW_HOST");
  const port = config.get("WORKFLOW_PORT");

  return new mediforProto.Pipeline(
    `${host}:${port}`,
    grpc.credentials.createInsecure()
  );
};

const workflowClient = init();

exports.listDetections = util.promisify(
  workflowClient.ListDetections.bind(workflowClient)
);

exports.getAnalyticStats = util.promisify(
  workflowClient.GetAnalyticStats.bind(workflowClient)
);

exports.getHistogram = util.promisify(
  workflowClient.GetHistogram.bind(workflowClient)
);

exports.deleteFailedAnalytics = util.promisify(
  workflowClient.DeleteFailedAnalytics.bind(workflowClient)
);

exports.getAnalyticsWithScores = util.promisify(
  workflowClient.GetAnalyticsWithScores.bind(workflowClient)
);

exports.fuseAllIDs = util.promisify(
  workflowClient.FuseAllIDs.bind(workflowClient)
);
