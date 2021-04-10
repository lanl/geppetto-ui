<template>
  <div class="frame-timeline">
    <svg
      class="is-overlay"
      :viewBox="`0 0 ${frames} 1`"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <rect
        v-for="(range, i) in frameData"
        :key="i"
        :x="range.range.start"
        y="0"
        :width="range.range.end - range.range.start"
        height="1"
        :fill="computeFill(range.score)"
      />
    </svg>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { interpolateGradient } from "@/helpers/colorGradients";

export default {
  name: "FrameTimeline",

  props: {
    frameData: Array
  },

  computed: {
    ...mapState({
      colormap: state => state.layout.colormap,
      probe: state => state.pipeline.probe
    }),

    frames() {
      return this.probe.meta["File:Frames"];
    }
  },

  methods: {
    computeFill(score) {
      const [r, g, b] = interpolateGradient(this.colormap, 1 - score);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
};
</script>

<style scoped>
.frame-timeline {
  background: linear-gradient(gray, whitesmoke);
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
