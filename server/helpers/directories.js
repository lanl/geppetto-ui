const path = require("path");
const fs = require("fs");
const config = require("config");

const applicationRoot = path.dirname(process.mainModule.filename);

const containerRoot = config.get("CONTAINER_ROOT");

/* WORKING_DIR does not exist in config file
 * Will pull from nodemon.json when building from source
 * WORKING_DIR is same as CONTAINER_ROOT when building from container
 * If building from container then CONTAINER_ROOT and WORKING_DIR are env variables from docker-compose */

const workingRoot = config.get("WORKING_DIR");

const directories = {
  thumbnails: "input/thumbnails"
};

const applicationDirectories = {
  inboxPath: path.join("/tmp", "inbox"),

  applicationOutputPath: path.join(workingRoot, "output"),
  applicationInputPath: path.join(workingRoot, "input"),

  thumbnailPath: path.join(workingRoot, "input", "thumbnails"),
  videoSourcesPath: path.join(workingRoot, "input"),
  transcodedVideoPath: path.join(workingRoot, "input", "transcoded")
};

const containerDirectories = {
  containerOutputPath: path.posix.join(containerRoot, "output"),
  containerInputPath: path.posix.join(containerRoot, "input")
};

Object.keys(applicationDirectories).forEach(directory => {
  const directoryPath = applicationDirectories[directory];
  try {
    fs.accessSync(directoryPath);
  } catch (err) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`✅  Making ${directoryPath}`);
  }
});

module.exports = {
  viewsRoot: path.join(applicationRoot, "views"),
  protosRoot: path.join(applicationRoot, "proto"),
  workingRoot,
  ...applicationDirectories,
  ...containerDirectories,
  ...directories
};
