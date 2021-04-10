<template>
  <div
    class="bulk-actions has-background-grey-lighter"
    v-show="selectedProbeCount > 0"
  >
    <div>
      Selected <strong>{{ selectedProbeCount }}</strong> of
      <strong>{{ probeCount }}</strong> probe(s)
    </div>

    <div class="buttons">
      <button
        class="button"
        :class="{ 'is-loading': isDownloadingProbes }"
        @click="downloadProbes"
      >
        <span class="icon is-small">
          <font-awesome-icon icon="download" />
        </span>
        <span>Download</span>
      </button>

      <button class="button" @click="tagProbesActive = true">
        <span class="icon is-small">
          <font-awesome-icon icon="tag" />
        </span>
        <span>Tag</span>
      </button>

      <button class="button is-danger" @click="deleteProbesActive = true">
        <span class="icon is-small">
          <font-awesome-icon icon="trash-alt" />
        </span>
        <span>Delete</span>
      </button>

      <button class="delete" @click="clearSelectedProbes"></button>
    </div>

    <TagProbes :active.sync="tagProbesActive" />
    <DeleteProbes :active.sync="deleteProbesActive" />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";

import TagProbes from "./TagProbes.vue";
import DeleteProbes from "./DeleteProbes.vue";

export default {
  name: "BulkActions",

  components: {
    TagProbes,
    DeleteProbes
  },

  data() {
    return {
      isDownloadingProbes: false,
      tagProbesActive: false,
      deleteProbesActive: false
    };
  },

  computed: {
    ...mapGetters(["selectedProbeCount", "probeCount"])
  },

  methods: {
    ...mapMutations(["clearSelectedProbes"]),
    ...mapActions(["downloadSelectedProbes"]),

    async downloadProbes() {
      this.isDownloadingProbes = true;

      try {
        await this.downloadSelectedProbes();
      } finally {
        this.isDownloadingProbes = false;
      }
    }
  }
};
</script>

<style>
.bulk-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 4px;
}
</style>
