const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = (sourcePath, destinationPath) => {
  const filename = path.parse(sourcePath)["name"] + ".jpg";
  const folder = path.dirname(destinationPath);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(sourcePath, (err, metadata) => {
      if (err) {
        console.log("Cannot process video", err);
        reject(err);
        return;
      }

      ffmpeg(sourcePath)
        .on("end", () => {
          resolve(destinationPath);
        })
        .on("error", function(err) {
          console.log("Cannot process video", err.message);
          reject(err);
        })
        .screenshots({
          folder,
          filename,
          timestamps: ["10%"],
          fastSeek: true,
          size: "?x150"
        });
    });
  });
};
