<template>
  <div
    class="gallery-image"
    :class="{ 'last-viewed': isLastViewed }"
    @click="selectCurrentProbe"
  >
    <span class="container">
      <img :src="parsedProbe.thumbnail" :alt="title" :title="title" />
      <span class="bottom-left" v-if="parsedProbe.hasFused">
        {{ score | score }}&nbsp;
      </span>
      <div v-if="duration" class="duration">
        {{ duration | duration }}
      </div>
      <span class="progressBar">
        <span
          class="progressFill has-background-primary"
          :style="computeProgress"
        ></span>
      </span>
    </span>
    <font-awesome-icon
      v-if="parsedProbe.isVideo"
      icon="play-circle"
      class="overlay-icon"
    />
    <div class="selected-overlay">
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('update:selected', $event.target.checked)"
        @click.stop
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import duration from "@/filters/duration";
import score from "@/filters/score";
/* parsedProbe is object returned from probeParser Mixin
it contains a variety of data on the currently selected probe */
import { probeParserMixin } from "../../mixins/probeParserMixin";

export default {
  name: "GalleryImage",
  mixins: [probeParserMixin],

  props: {
    probe: Object,
    selected: Boolean
  },

  filters: {
    duration,
    score
  },

  methods: {
    //switches the currently selected probe
    selectCurrentProbe() {
      this.$router.push(`/probes/${this.probe.id}`);
    }
  },

  computed: {
    ...mapState({
      lastViewedProbe: state => state.pipeline.probe
    }),

    isLastViewed() {
      return this.lastViewedProbe && this.lastViewedProbe.id === this.probe.id;
    },

    title() {
      return this.probe.meta["File:Title"] || this.probe.meta["File:FileName"];
    },

    score() {
      return this.probe.fused_score;
    },

    computeProgress: function() {
      let ratio = this.probe.analytics_finished / this.probe.analytics_total;
      return {
        width: ratio * 100 + "%"
      };
    },

    duration() {
      return this.probe.meta["QuickTime:Duration"];
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";

.gallery-image {
  position: relative;
  flex: 1 1 auto;
  padding: 4px;
  cursor: pointer;
  margin: 1px 1px;
  box-sizing: border-box;
  border-radius: 4px;
  height: 150px;
}

.gallery-image:hover {
  box-shadow: 0 2px 6px 2px #888888;
  transition: 0.3s;
}

.gallery-image.last-viewed img {
  opacity: 0.25;
}

img {
  height: 100%;
  object-fit: cover;
  max-width: 100%;
  min-width: 100%;
  vertical-align: bottom;
}

.overlay-icon {
  position: absolute;
  color: white;
  top: 50%;
  left: 50%;
  font-size: 4em;
  text-align: center;
  transform: translate(-50%, -50%);
  opacity: 0.5;
}

.container {
  position: relative;
  text-align: center;
  color: white;
}

.bottom-left {
  position: absolute;
  bottom: 0px;
  display: block;
  background-color: $light;
  color: #333;
  padding: 2px 3px;
  font-size: 0.75em;
  font-weight: 600;
  border-radius: 0 6px 0 0;
  transition: 0.3s;
}

.duration {
  position: absolute;
  right: 0;
  bottom: 0;
  background-color: $light;
  border-top-left-radius: 6px;
  color: #333;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 3px;
}

.progressBar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 4px;
  background: #333;
  z-index: 100;
  transition: 0.3s;
}
.progressFill {
  position: absolute;
  left: 0;
  height: 4px;
  transition: 0.3s;
}

.selected-overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 16px;
}
</style>
