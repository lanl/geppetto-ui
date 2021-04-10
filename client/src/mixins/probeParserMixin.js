export const probeParserMixin = {
  computed: {
    /* parsedProbe()  is used to centralized logic across across components that need to access data for the currently selected probe
     * parsedProbe() will return a JSON Object with several data fields
     * Data Returned:
     *
     * type => string value of the type of media...either "image" or "video"
     * source => source for the probe itself...either .img or  .mp4
     * thumbnail => source for the thumbnail of the probe to be displayed in the gallery...always .mp4
     * status => string value stating that the probe has completed parsing
     * name => string value for the name of the file uploaded
     * id =>  string value for the unique probe hash
     * galleryFusedScore => integer value for the 'fused score' of the probe...when performing a detectionListRequest the 'fused_score" value
     *                         will be populated which returns the fusion score of the currently selected fusion algorithm. This is only used for
     *                         display in the gallery
     * hasFused => boolean value for whether or not the currently selected probe has a fused score
     */
    parsedProbe() {
      if (!this.probe) {
        return {};
      }

      const { id, meta, tags } = this.probe;
      const { type } = tags;
      let source;

      if (type === "image") {
        source = `input/${id}.${meta["File:FileTypeExtension"]}`;
      } else if (type === "video") {
        source = `input/transcoded/${id}.mp4`;
      }

      return {
        isImage: type === "image",
        isVideo: type === "video",
        type,
        source,
        thumbnail: `input/thumbnails/${id}.jpg`,
        status: "parsed",
        name: meta["File:FileName"],
        id,
        hasFused: this.probe.has_fused
      };
    }
  }
};
