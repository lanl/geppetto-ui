<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Probe Metadata</p>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Title</label>
          <div class="control">
            <input class="input" type="text" v-model="title" />
          </div>
        </div>
        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <textarea
              class="textarea"
              rows="10"
              v-model="description"
            ></textarea>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-primary"
          :class="{ 'is-loading': loading }"
          @click="saveChanges"
        >
          Save changes
        </button>
        <button class="button" @click="close">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "EditProbeMetadataModal",

  props: {
    active: {
      type: Boolean,
      default: false
    },

    probe: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      title: "",
      description: "",
      loading: false
    };
  },

  methods: {
    ...mapActions(["updateProbeMetadata"]),

    async saveChanges() {
      this.loading = true;

      try {
        await this.updateProbeMetadata({
          ["File:Title"]: this.title,
          ["File:Description"]: this.description
        });

        this.$emit("update");
      } finally {
        this.loading = false;
        this.close();
      }
    },

    close() {
      this.$emit("update:active", false);
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.title =
          this.probe.meta["File:Title"] || this.probe.meta["File:FileName"];
        this.description = this.probe.meta["File:Description"];
      }
    }
  }
};
</script>
