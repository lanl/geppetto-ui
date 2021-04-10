<template>
  <div class="upload-container">
    <header>
      <div class="toolbar">
        <div class="file is-primary">
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              multiple
              name="probe"
              accept="image/*,video/mp4,video/x-m4v,video/*"
              @change="addUploadProbes($event.target.files)"
            />
            <span class="file-cta">
              <span class="file-icon">
                <font-awesome-icon icon="file-upload" />
              </span>
              <span class="file-label">Select files...</span>
            </span>
          </label>
        </div>

        <TagInput
          class="is-flex-grow"
          placeholder="Add tags"
          :value="tags"
          @input="setUploadTags($event)"
        />

        <button
          class="button is-success"
          :disabled="isUploading || probes.length === 0"
          @click="uploadProbes"
        >
          <span class="icon is-small">
            <font-awesome-icon icon="upload" />
          </span>
          <span>Upload</span>
        </button>

        <button
          class="button is-danger"
          @click="cancelUploadProbes"
          :disabled="!isUploading"
        >
          Cancel
        </button>
      </div>

      <progress
        v-if="isUploading"
        class="progress is-success is-tiny is-radiusless"
        :value="progress"
        :max="total"
      />
    </header>

    <main>
      <table
        class="table is-fullwidth"
        v-if="!isUploading && probes.length > 0"
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th v-if="anyErrors">Error</th>
            <th class="shrink">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(probe, index) in probes" :key="index">
            <td>{{ probe.file.name }}</td>
            <td>{{ probe.file.size }}&nbsp;bytes</td>
            <td>{{ probe.file.type }}</td>
            <td v-if="anyErrors">
              <span
                v-if="
                  probe.error &&
                    probe.error.response &&
                    probe.error.response.status === 400
                "
                >Unsupported file format or codec</span
              >
              <span v-else-if="probe.error">{{ probe.error.message }}</span>
            </td>
            <td class="shrink">
              <a
                class="tag is-danger is-delete is-medium"
                @click="removeUploadProbe(index)"
              ></a>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="isUploading">
        <div class="centered-message">
          Uploading...<br />
          <font-awesome-icon icon="spinner" class="fa-spin" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import TagInput from "../common/TagInput.vue";

export default {
  name: "UploadContainer",

  components: {
    TagInput
  },

  computed: {
    ...mapState({
      probes: state => state.upload.probes,
      tags: state => state.upload.tags,
      isUploading: state => state.upload.isUploading,
      progress: state => state.upload.progress,
      total: state => state.upload.total
    }),

    anyErrors() {
      return this.probes.some(probe => probe.error);
    }
  },

  methods: {
    ...mapMutations(["addUploadProbes", "removeUploadProbe", "setUploadTags"]),
    ...mapActions(["uploadProbes", "cancelUploadProbes", "fetchTagCounts"])
  },

  created() {
    this.fetchTagCounts();
  }
};
</script>

<style scoped>
.upload-container {
  height: 100%;
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  background-color: #ddd;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.upload-container main {
  background: white;
  flex: auto;
  overflow-y: scroll;
}

td.shrink,
th.shrink {
  white-space: nowrap;
  width: 1px;
  text-align: center;
}

.centered-message {
  padding: 20%;
  height: 100%;
  width: 100%;
  text-align: center;
  font-size: 1.5em;
}
</style>
