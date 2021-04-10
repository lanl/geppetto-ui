<template>
  <div ref="Gallery" id="gallery">
    <section v-if="galleryMode === 'grid'">
      <GalleryImage
        v-for="probe in probes"
        :key="probe.id"
        :probe="probe"
        :selected="isProbeSelected(probe.id)"
        @update:selected="selectProbe({ probeId: probe.id, selected: $event })"
      />
    </section>
    <section v-else>
      <ContentCard
        v-for="probe in probes"
        :key="probe.id"
        :probe="probe"
        :selected="isProbeSelected(probe.id)"
        @update:selected="selectProbe({ probeId: probe.id, selected: $event })"
      />
    </section>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState, mapGetters } from "vuex";

import GalleryImage from "./GalleryImage.vue";
import ContentCard from "./ContentCard.vue";

export default {
  name: "Gallery",

  components: {
    GalleryImage,
    ContentCard
  },

  methods: {
    ...mapMutations(["selectProbe", "setGalleryScrollPosition"]),
    ...mapActions(["fetchProbes", "fetchMoreProbes"]),

    handleScroll() {
      let bottomOfWindow =
        this.$refs.Gallery.scrollTop + this.$refs.Gallery.offsetHeight + 100 >=
        this.$refs.Gallery.scrollHeight;

      if (bottomOfWindow) {
        this.fetchMoreProbes();
      }

      this.setGalleryScrollPosition(this.$refs.Gallery.scrollTop);
    }
  },

  computed: {
    ...mapState({
      filters: state => state.filters,
      galleryMode: state => state.layout.galleryMode,
      galleryScrollPosition: state => state.layout.galleryScrollPosition,
      probe: state => state.pipeline.probe,
      isLoading: state => state.probes.isLoading,
      probes: state => state.probes.probes,
      probesAreValid: state => state.probes.probesAreValid
    }),

    ...mapGetters(["isProbeSelected"])
  },

  watch: {
    probesAreValid: {
      handler() {
        if (!this.probesAreValid) {
          this.fetchProbes();
        }
      },
      immediate: true
    }
  },

  mounted() {
    //this.handleScroll();
    this.$refs.Gallery.addEventListener("scroll", this.handleScroll);

    // pause and check if we need to load more once images render.
    /** Explanation: if we run this on say, a double-wide monitor and 50 probes
     * load but dont reach the bottom of the screen then the scroll even wont trigger
     * to load more images. we need to reach the bottom of the screen if we can  */
    var _v = this;
    var interval = setInterval(() => {
      if (!_v.isLoading && _v.$refs.Gallery !== undefined) {
        let bottomOfWindow =
          _v.$refs.Gallery.scrollTop + _v.$refs.Gallery.offsetHeight ===
          _v.$refs.Gallery.scrollHeight;

        if (bottomOfWindow) {
          _v.fetchMoreProbes();
        } else {
          clearInterval(interval);
        }
      }
    }, 1000);

    this.$refs.Gallery.scrollTop = this.galleryScrollPosition;
  },

  beforeDestroy() {
    this.$refs.Gallery.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style lang="scss" scoped>
#gallery {
  overflow-y: auto;

  height: 100%;
  max-height: 100%;
}
section {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 50px;
  height: auto;
  pointer-events: all;
}
section::after {
  content: "";
  flex-grow: 999999999;
}

.center-message {
  width: 100%;
  height: 100%;
  line-height: 100%;
  vertical-align: middle;
  text-align: center;
}
</style>
