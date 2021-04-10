<template>
  <div class="analytic_card__mask">
    <span
      v-if="maskData.detectionType == 'fuser'"
      class="analytic_card__mask--text"
    >
      <span v-if="maskData.isImage">No Mask</span>
      <font-awesome-icon v-else icon="play-circle" size="lg" />
    </span>
    <img
      class="analytic_card__mask--image"
      v-else-if="maskData.hasMask"
      :src="url"
      alt="mask"
    />
    <p
      class="analytic_card__mask--text"
      v-else-if="maskData.status.completed || maskData.status.optedOut"
    >
      <span v-if="maskData.isImage">No Mask</span>
      <font-awesome-icon v-else icon="play-circle" size="lg" />
    </p>
    <p class="analytic_card__mask--text" v-else-if="maskData.status.failed">
      ✖️
    </p>
    <i class="analytic_card__mask--icon" v-else-if="!maskData.status.queued"
      ><font-awesome-icon icon="spinner" class="fa-spin"
    /></i>
    <p class="analytic_card__mask--text analytic_card__mask--ellipsis" v-else>
      ...
    </p>
    <div v-if="frameDataExists()" class="analytic_card__mask--timeline">
      <FrameTimeline
        :frameData="maskData.data.vid_manip.localization.frame_detection"
      />
    </div>
  </div>
</template>

<script>
import FrameTimeline from "../../common/FrameTimeline";

export default {
  name: "DetectorMask",
  data: function() {
    return {};
  },
  props: {
    maskData: {}
  },
  components: {
    FrameTimeline
  },
  computed: {
    url: function() {
      var url = this.$store.getters.baseUri;
      const detector = this.maskData.data;
      if (this.maskData.isImage) {
        var filename = detector.img_manip.localization.mask.uri;
        var start = filename.indexOf("output/");
        filename = filename.substring(start);
        url += "/" + filename;
      } else {
        console.log("Unimplemented");
      }
      return url;
    }
  },
  methods: {
    frameDataExists() {
      const detector = this.maskData.data;
      return (
        detector.vid_manip !== undefined &&
        detector.vid_manip.localization !== null &&
        detector.vid_manip.localization.frame_detection.length > 0
      );
    }
  }
};
</script>

<style scoped>
.analytic_card__mask {
  flex: 0 0 70px;
  height: 70px;
  max-height: 70px;
  border: solid 1px #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  background: hsla(0, 0%, 100%, 0.5);
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-items: center;
}

.analytic_card__mask--text {
  text-align: center;
  font-size: 0.8rem;
}

.analytic_card__mask > * {
  flex-grow: 1;
  flex-basis: 1rem;
  display: flex;
  align-items: center;
}

.analytic_card__mask--image {
  width: 100%;
  height: 100%;
  max-height: 68px;
  vertical-align: middle;
  object-fit: cover;
}

.analytic_card__mask--ellipsis {
  font-size: 2rem;
  background: linear-gradient(
    to right,
    hsla(0, 0%, 20%, 0.2),
    hsla(0, 0%, 20%, 0.8),
    hsla(0, 0%, 20%, 0.2)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.analytic_card__mask--timeline {
  height: 8px;
  width: 100%;
  flex: 0 0 8px;
}
</style>
