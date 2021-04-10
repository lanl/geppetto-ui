const ffmpeg = require("fluent-ffmpeg");

function transcode(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOption("-pix_fmt yuv420p")
      .on("end", () => {
        resolve();
      })
      .on("error", err => {
        reject(err);
      })
      .save(output);
  });
}

module.exports = transcode;
