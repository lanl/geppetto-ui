<template>
  <div id="gallery-container" class="card">
    <header>
      <div class="toolbar">
        <div class="buttons has-addons">
          <button
            class="button"
            :class="{
              'is-primary': galleryMode === 'grid',
              'is-selected': galleryMode === 'grid'
            }"
            title="Grid view"
            @click="setGalleryMode('grid')"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="th" />
            </span>
          </button>

          <button
            class="button"
            :class="{
              'is-primary': galleryMode === 'list',
              'is-selected': galleryMode === 'list'
            }"
            title="List view"
            @click="setGalleryMode('list')"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="list" />
            </span>
          </button>
        </div>

        <ScoreSourceSelect />

        <Search class="is-flex-grow" />

        <button class="button" @click="selectAllProbes">
          <span class="icon is-small">
            <font-awesome-icon icon="check-square" />
          </span>
          <span>Select all</span>
        </button>

        <button class="button" @click="refresh">
          <span class="icon is-small">
            <font-awesome-icon icon="sync" />
          </span>
          <span>Refresh</span>
        </button>

        <div class="buttons has-addons">
          <a
            class="button"
            title="Download all"
            :href="downloadURL"
            target="_blank"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="download" />
            </span>
          </a>

          <a
            class="button"
            title="Export all as CSV"
            :href="csvURL"
            target="_blank"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="file-csv" />
            </span>
          </a>

          <a
            class="button"
            title="Export all as JSON"
            :href="jsonURL"
            target="_blank"
          >
            <span class="icon is-small">
              <font-awesome-icon icon="file-code" />
            </span>
          </a>
        </div>

        <div class="select">
          <select
            title="Sort probes by"
            :value="sort"
            @change="changeSort($event)"
          >
            <option value="File:UploadDate.desc">
              &darr; Date
            </option>
            <option value="File:UploadDate.asc">
              &uarr; Date
            </option>
            <option value="score.asc">
              &darr; Integrity
            </option>
            <option value="score.desc">
              &uarr; Integrity
            </option>
            <option value="File:FileName.desc">
              &darr; Name
            </option>
            <option value="File:FileName.asc">
              &uarr; Name
            </option>
          </select>
        </div>
      </div>

      <BulkActions />
    </header>

    <!-- end header -->

    <!-- gallery or table-->
    <main class="gallery">
      <Gallery />
    </main>

    <!-- footer probe count -->
    <!-- Check that the 'galleryTotal' has computed before displaying it -->
    <footer
      v-if="hasGallery && typeof galleryTotal === 'number'"
      class="gallery-footer is-size-7"
    >
      <span class="label-font">Probes</span>
      <span class="has-text-right"> ({{ galleryTotal }})&nbsp;</span>
    </footer>

    <!-- loading indicator -->
    <div id="load-indicator" :class="{ active: isLoading }">
      <div class="centered-message" :class="{ active: isLoading }">
        Loading<br />
        <font-awesome-icon icon="spinner" class="fa-pulse" />
      </div>
    </div>
  </div>
</template>

<script>
/* parsedProbe is object returned from probeParser Mixin
it contains a variety of data on the currently selected probe */
import { saveAs } from "file-saver";
import Gallery from "./Gallery.vue";
import { mapActions, mapMutations, mapState, mapGetters } from "vuex";
import { probeParserMixin } from "../../mixins/probeParserMixin";
import ScoreSourceSelect from "@/components/common/ScoreSourceSelect.vue";
import BulkActions from "./BulkActions.vue";
import Search from "./Search.vue";

export default {
  name: "GalleryContainer",
  mixins: [probeParserMixin],
  components: {
    BulkActions,
    Gallery,
    Search,
    ScoreSourceSelect
  },
  methods: {
    ...mapMutations([
      "invalidateProbes",
      "invalidateTagCounts",
      "setGalleryMode",
      "selectAllProbes",
      "clearSelectedProbes"
    ]),

    ...mapActions(["setSortField", "setSortDir"]),

    changeSort(event) {
      var [newField, newDir] = event.target.value.split(".");
      this.setSortField(newField);
      this.setSortDir(newDir);
    },

    refresh() {
      //call both to update gallery
      this.invalidateProbes();
      this.invalidateTagCounts();
      this.clearSelectedProbes();
    },

    downloadMedia() {
      saveAs(this.downloadURL);
    }
  },
  computed: {
    ...mapState({
      galleryMode: state => state.layout.galleryMode,
      galleryTotal: state => state.probes.total,
      isLoading: state => state.probes.isLoading,
      probe: state => state.pipeline.probe,
      probes: state => state.probes.probes,
      sortField: state => state.filters.sortField,
      sortDir: state => state.filters.sortDir,
      hasGallery: state => state.probes.probes.length > 0
    }),

    ...mapGetters(["baseUri", "downloadURL", "csvURL", "jsonURL"]),

    sort() {
      return [this.sortField, this.sortDir < 0 ? "desc" : "asc"].join(".");
    }
  }
};
</script>

<style lang="scss" scoped>
#gallery-container {
  position: relative;
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.label-font {
  font-weight: 500;
}

.gallery {
  flex: auto;
  margin: 3px;
  overflow-y: scroll;
  position: relative;
}

.gallery-footer {
  text-align: center;
  background-image: linear-gradient(to top, white, #d0d0d0);
}

#load-indicator {
  position: absolute;
  top: 40px;
  bottom: 0px;
  left: 0;
  right: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0);
  z-index: 999999;
  transition: 0.5s;
}
#load-indicator.active {
  background: rgba(0, 0, 0, 0.5);
}
.centered-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 1.5em;
  color: white;
  font-weight: 900;
  -webkit-text-fill-color: white;
  -webkit-text-stroke-color: black;
  -webkit-text-stroke-width: 1px;
  opacity: 0;
  transition: 0.5s;
}
.centered-message.active {
  opacity: 1;
}
</style>
