<template>
  <div v-if="probe" class="probe-container">
    <div class="header">
      <div class="toolbar">
        <div class="buttons has-addons">
          <router-link
            class="button"
            title="Previous"
            :disabled="!previousProbe"
            :to="previousProbe"
            replace
          >
            <span class="icon is-small">
              <font-awesome-icon icon="chevron-left" />
            </span>
          </router-link>

          <router-link
            class="button"
            title="Next"
            :disabled="!nextProbe"
            :to="nextProbe"
            replace
          >
            <span class="icon is-small">
              <font-awesome-icon icon="chevron-right" />
            </span>
          </router-link>
        </div>

        <!-- Zoom -->
        <div class="buttons has-addons" v-if="parsedProbe.isImage">
          <button class="button" title="Zoom out" @click="zoomOut">
            <span class="icon is-small">
              <font-awesome-icon icon="minus" />
            </span>
          </button>

          <button class="button" title="Reset zoom" @click="resetTransform">
            {{ parseInt(zoomState) }}%
          </button>

          <button class="button" title="Zoom in" @click="zoomIn">
            <span class="icon is-small">
              <font-awesome-icon icon="plus" />
            </span>
          </button>
        </div>

        <!--Rotate 90d CCW - CW only show if image seelcted-->
        <div class="buttons has-addons" v-if="parsedProbe.isImage">
          <button
            class="button"
            title="Rotate 90 degrees counterclockwise"
            @click="rotateLeft"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="undo" />
            </span>
          </button>

          <button
            class="button"
            title="Rotate 90 degrees clockwise"
            @click="rotateRight"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="redo" />
            </span>
          </button>
        </div>

        <!-- Colorgrading Legend if mask selected-->
        <div class="field" v-if="maskUrl !== '' || !imageSelected">
          <div class="control has-icons-left">
            <div class="select">
              <select
                title="Colormap"
                v-model="colormap"
                @change="changeColormap($event)"
              >
                <option
                  v-for="mode in colormaps"
                  :key="mode.map"
                  :value="mode.map"
                >
                  {{ mode.name }}
                </option>
              </select>
            </div>
            <div class="icon is-small is-left">
              <div :style="gradientStyle"></div>
            </div>
          </div>
        </div>

        <OpacitySlider
          class="has-align-self-center"
          v-if="imageSelected && maskUrl !== ''"
        />

        <div class="select" v-if="imageSelected && maskUrl !== ''">
          <select title="View mode" v-model="viewMode">
            <option v-for="mode in viewModes" :key="mode" :value="mode">{{
              mode
            }}</option>
          </select>
        </div>

        <button
          v-if="parsedProbe.isVideo"
          class="button"
          :class="{ 'is-primary': showScoreAnnotations }"
          title="Toggle video annotations"
          @click="toggleShowScoreAnnotations"
        >
          <span class="icon is-small">
            <font-awesome-icon icon="font" />
          </span>
        </button>

        <div class="is-flex-grow has-align-self-center">
          {{ title }}
        </div>

        <div class="select">
          <select
            title="Sort analytics by"
            @change="changeAnalyticSort($event)"
          >
            <option
              value="score"
              :selected="$store.getters.analyticSortField === 'score'"
              >Integrity</option
            >
            <option
              value="name"
              :selected="$store.getters.analyticSortField === 'name'"
              >Name</option
            >
            <option
              value="mask"
              :selected="$store.getters.analyticSortField === 'mask'"
              >Mask</option
            >
          </select>
        </div>

        <div class="buttons has-addons">
          <a class="button" title="Download" @click.prevent="downloadMedia">
            <span class="icon is-small">
              <font-awesome-icon icon="download" />
            </span>
          </a>

          <a
            class="button"
            title="Export as CSV"
            :href="CSVurl"
            target="_blank"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="file-csv" />
            </span>
          </a>

          <a
            class="button"
            title="Export as PDF"
            :href="PDFurl"
            target="_blank"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="file-pdf" />
            </span>
          </a>
        </div>

        <div class="buttons has-addons">
          <button
            class="button"
            title="Edit metadata"
            :disabled="!probe"
            @click="editProbeMetadataActive = true"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="pen" />
            </span>
          </button>

          <button
            class="button is-danger"
            title="Delete"
            :disabled="!probe"
            @click="deleteProbeActive = true"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="trash-alt" />
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ProbeView -->
    <div
      class="probe-viewer"
      @wheel.prevent="wheelZoom($event)"
      @dblclick="resetTransform"
    >
      <ProbeView
        :zoomState="zoomState"
        :rotateState="rotateState"
        :blendMode="blendMode"
        :viewMode="viewMode"
      />
    </div>

    <div class="details">
      <div class="tabs is-fullwidth is-small is-toggle is-marginless">
        <ul>
          <li
            v-for="tab in tabs"
            :key="tab.name"
            :class="{ 'is-active': tab === selectedTab }"
          >
            <a @click="selectedTab = tab">{{ tab.name }}</a>
          </li>
        </ul>
      </div>
      <component
        :is="selectedTab.component"
        :probe="probe"
        :probeId="probeId"
      />
    </div>

    <EditProbeMetadataModal
      :active.sync="editProbeMetadataActive"
      :probe="probe"
    />

    <DeleteProbeModal
      :active.sync="deleteProbeActive"
      :probe="probe"
      @delete="$router.push('/probes')"
    />
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { probeParserMixin } from "../../mixins/probeParserMixin";

import OpacitySlider from "@/components/common/OpacitySlider.vue";
import DeleteProbeModal from "@/components/modals/DeleteProbeModal.vue";
import EditProbeMetadataModal from "@/components/modals/EditProbeMetadataModal.vue";

import Detectors from "./Detectors.vue";
import Metadata from "./Metadata.vue";
import ProbeBookmarks from "./ProbeBookmarks.vue";
import ProbeView from "./ProbeView.vue";
import Tags from "./Tags.vue";

export default {
  name: "ProbeContainer",

  components: {
    DeleteProbeModal,
    EditProbeMetadataModal,
    OpacitySlider,
    ProbeView
  },

  mixins: [probeParserMixin],

  props: {
    probeId: {
      type: String,
      required: true
    }
  },

  data: function() {
    return {
      base_uri: this.$store.getters.baseUri,
      rotateState: 0,
      zoomState: 100,
      blendMode: "normal",
      supportBlendModes: [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "difference",
        "exclusion",
        "luminosity"
      ],
      viewMode: "overlay",
      viewModes: ["overlay", "horizontal", "vertical"], //, "zoom"
      colormap: "spectral",
      colormaps: [
        { name: "Cividis", map: "cividis" },
        { name: "Grey Scale - W/B", map: "greyscale" },
        { name: "Grey Scale - B/W", map: "invertedgreyscale" },
        { name: "Inferno", map: "inferno" },
        { name: "Viridis", map: "viridis" },
        { name: "Spectral", map: "spectral" }
      ],
      tabs: [
        {
          name: "Detectors",
          component: Detectors
        },
        {
          name: "Metadata",
          component: Metadata
        },
        {
          name: "Tags",
          component: Tags
        },
        {
          name: "Bookmarks",
          component: ProbeBookmarks
        }
      ],
      selectedTab: null,
      editProbeMetadataActive: false,
      deleteProbeActive: false
    };
  },

  computed: {
    ...mapState({
      showScoreAnnotations: state => state.layout.showScoreAnnotations,
      probe: state => state.pipeline.probe,
      probes: state => state.probes.probes
    }),

    ...mapGetters(["imageSelected", "maskUrl"]),

    title() {
      return this.probe.meta["File:Title"] || this.probe.meta["File:FileName"];
    },

    meta() {
      return this.$store.getters.probe == null ? {} : this.$store.getters.meta;
    },

    previousProbe() {
      const index = this.probes.findIndex(probe => probe.id === this.probeId);

      if (index <= 0) {
        return "";
      }

      return `/probes/${this.probes[index - 1].id}`;
    },

    nextProbe() {
      const index = this.probes.findIndex(probe => probe.id === this.probeId);

      if (index < 0) {
        return "";
      }

      if (index === this.probes.length - 1) {
        this.fetchMoreProbes();
        return "";
      }

      return `/probes/${this.probes[index + 1].id}`;
    },

    gradientStyle: function() {
      var grad = this.$store.getters.colormap;
      var linGrad = "linear-gradient(to left,";
      // add each color step
      for (const color of grad) {
        linGrad += `rgb(${color[0]},${color[1]},${color[2]}),`;
      }
      // remove last comma
      linGrad = linGrad.substring(0, linGrad.length - 1);
      return {
        background: `${linGrad})`,
        width: "20px",
        height: "20px"
      };
    },

    probeUrl: function() {
      if (!this.$store.getters.probe) {
        return null;
      }

      var url = this.$store.getters.baseUri + "/input/";
      var filename;

      if (this.$store.getters.probe.analytic_info[0].detection.img_manip_req) {
        filename = this.$store.getters.probe.analytic_info[0].detection
          .img_manip_req.image.uri;
      } else {
        filename = this.$store.getters.probe.analytic_info[0].detection
          .vid_manip_req.video.uri;
      }

      var start = filename.indexOf("input/") + 6;
      filename = filename.substring(start);
      url += filename;
      return url;
    },

    url: function() {
      if (!this.$store.getters.probe) {
        return null;
      }

      var url = this.$store.getters.baseUri;
      const id = this.$store.getters.probe.id;
      const fusion = this.$store.getters.fusionModel;
      url += "/probes/" + id + "?";
      url += `includefused=1&fuser_id=${fusion}&download=yes`;

      return url;
    },

    CSVurl: function() {
      if (!this.$store.getters.probe) {
        return null;
      }

      var url = this.$store.getters.baseUri;
      const id = this.$store.getters.probe.id;
      const fusion = this.$store.getters.fusionModel;
      url += "/probes/" + id + "/csv?";
      url += `includefused=1&fuser_id=${fusion}`;

      return url;
    },

    PDFurl: function() {
      if (!this.$store.getters.probe) {
        return null;
      }

      var url = this.$store.getters.baseUri;
      const id = this.$store.getters.probe.id;
      const fusion = this.$store.getters.fusionModel;
      url += "/probes/" + id + "/pdf?";
      url += `includefused=1&fuser_id=${fusion}`;

      return url;
    },

    wantsFused: function() {
      return this.$store.getters.fusionModel !== "";
    }
  },

  watch: {
    probeId: {
      handler() {
        this.clearProbe();
        this.selectProbe({ probe: { id: this.probeId } });
        this.resetTransform();
      },
      immediate: true
    }
  },

  mounted() {
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case "selectMask":
          if (this.viewMode !== "overlay") this.blendMode = "normal";
          break;
      }
    });
  },

  methods: {
    ...mapMutations(["clearProbe", "toggleShowScoreAnnotations"]),
    ...mapActions(["fetchMoreProbes", "selectProbe"]),

    rotateRight() {
      this.rotateState = (this.rotateState + 1) % 4;
    },
    rotateLeft() {
      this.rotateState = this.rotateState == 0 ? 3 : this.rotateState - 1;
    },
    resetTransform() {
      this.zoomState = 100;
      this.rotateState = 0;
    },
    zoomIn() {
      this.zoomState += 50;
      this.zoomState = Math.min(this.zoomState, 500);
    },
    zoomOut() {
      this.zoomState -= 50;
      this.zoomState = Math.max(this.zoomState, 50);
    },
    wheelZoom(e) {
      //normalize scroll speed because firefox is p dumb
      var scrollSpeed = e.deltaY;
      while (Math.abs(scrollSpeed) > 10)
        scrollSpeed = Math.floor(scrollSpeed / 10);

      this.zoomState -= scrollSpeed * Math.floor(this.zoomState / 50);
      this.zoomState =
        this.zoomState <= 50
          ? 50
          : this.zoomState >= 500
          ? 500
          : this.zoomState;
    },
    changeColormap(event) {
      this.$store.commit("selectColormap", event.target.value);
    },
    changeAnalyticSort(event) {
      let val = event.target.value;
      if (val == "name") {
        this.$store.commit("setAnalyticSortField", val);
        this.$store.commit("setAnalyticSortDir", 1);
      } else if (val == "score") {
        this.$store.commit("setAnalyticSortField", val);
        this.$store.commit("setAnalyticSortDir", -1);
      } else if (val == "mask") {
        this.$store.commit("setAnalyticSortField", val);
        this.$store.commit("setAnalyticSortDir", -1);
      } else {
        alert("ERROR");
      }
    },
    downloadMedia() {
      saveAs(this.probeUrl, this.$store.getters.probe.meta["File:FileName"]);
    }
  },

  created() {
    this.selectedTab = this.tabs[0];
  }
};
</script>

<style scoped>
.probe-container {
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background: #eee;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 400px;
  border-radius: 3px;
}

.header {
  grid-column: 1 / -1;
}

.details {
  overflow-y: auto;
}

.probe-viewer {
  background: white;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
