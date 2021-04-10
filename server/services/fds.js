const config = require("config");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const promisify = require("grpc-promisify");

const { protosRoot } = require("../helpers/directories");

const packageDefinition = protoLoader.loadSync("fds.proto", {
  includeDirs: [protosRoot],
  defaults: true,
  enums: String
});

const {
  seeingstrings: {
    fds: { FaceDetection }
  }
} = grpc.loadPackageDefinition(packageDefinition);

let fds = null;

if (config.has("FDS_ADDRESS")) {
  fds = new FaceDetection(
    config.get("FDS_ADDRESS"),
    grpc.credentials.createInsecure()
  );

  promisify(fds);
}

module.exports = fds;
