<template>
  <svg
    class="is-overlay"
    :viewBox="`0 0 ${videoWidth} ${videoHeight}`"
    width="100%"
    height="100%"
  >
    <g v-for="(annotation, index) in activeAnnotations" :key="index">
      <rect
        class="rect"
        :x="annotation.coords[0]"
        :y="annotation.coords[1]"
        :width="annotation.coords[2] - annotation.coords[0]"
        :height="annotation.coords[3] - annotation.coords[1]"
        :stroke="annotation.color"
      />
      <text
        v-if="showScoreAnnotations && annotation.hasScore"
        class="text"
        :x="annotation.coords[0]"
        :y="annotation.coords[3] + 16"
        :fill="annotation.color"
      >
        {{ annotation.score | score }}
      </text>
    </g>
  </svg>
</template>

<script>
import axios from "axios";
import { mapState, mapMutations } from "vuex";
import score from "@/filters/score";
import { interpolateGradient } from "@/helpers/colorGradients";

export default {
  name: "VideoAnnotationOverlay",

  props: {
    time: {
      type: Number,
      required: true
    },

    videoWidth: {
      type: Number,
      required: true
    },

    videoHeight: {
      type: Number,
      required: true
    }
  },

  filters: {
    score
  },

  data() {
    return {
      annotations: []
    };
  },

  computed: {
    ...mapState({
      colormap: state => state.layout.colormap,
      showScoreAnnotations: state => state.layout.showScoreAnnotations,
      probe: state => state.pipeline.probe,
      selectedAnalytic: state => state.pipeline.selectedAnalytic
    }),

    activeAnnotations() {
      return this.annotations
        .filter(({ start, end }) => this.time >= start && this.time < end)
        .map(({ coords, score }) => ({
          coords,
          color: this.colorFor(1 - score),
          hasScore: Number.isFinite(score),
          score
        }));
    },

    annotationUrl() {
      if (!this.probe) {
        return null;
      }

      const analyticInfo = this.probe.analytic_info.find(
        analyticInfo => analyticInfo.analytic_id === this.selectedAnalytic
      );

      if (!analyticInfo) {
        return null;
      }

      const vidManip = analyticInfo.detection.vid_manip;

      if (!vidManip) {
        return null;
      }

      const supplement = vidManip.supplement.find(supplement =>
        supplement.uri.endsWith("/videoAnnotations.json")
      );

      if (!supplement) {
        return null;
      }

      return this.mapResourceUri(supplement.uri);
    }
  },

  methods: {
    ...mapMutations(["showError"]),

    colorFor(score) {
      if (!Number.isFinite(score)) {
        return "gray";
      }

      const [r, g, b] = interpolateGradient(this.colormap, score);
      return `rgb(${r}, ${g}, ${b})`;
    },

    async fetchAnnotations() {
      if (!this.annotationUrl) {
        this.annotations = [];
        return;
      }

      try {
        const { data } = await axios.get(this.annotationUrl);
        this.annotations = data.annotations || [];
      } catch (error) {
        this.showError(error);
      }
    },

    mapResourceUri(uri) {
      return uri.substring(uri.indexOf("/output/"));
    }
  },

  watch: {
    annotationUrl: {
      handler() {
        this.fetchAnnotations();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.rect {
  fill: transparent;
  stroke-width: 2px;
}

.text {
  font-weight: bold;
}
</style>
