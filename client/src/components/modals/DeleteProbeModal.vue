<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Delete Probe</p>
      </header>
      <section class="modal-card-body">
        <div class="media">
          <figure class="media-left">
            <font-awesome-icon
              class="has-text-danger"
              icon="exclamation-circle"
              size="4x"
            />
          </figure>
          <div class="media-content">
            <p>
              Are you sure you want to delete {{ title }}? This action cannot be
              undone.
            </p>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-danger"
          :class="{ 'is-loading': loading }"
          @click="doDelete"
        >
          Delete
        </button>
        <button class="button" @click="close">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "DeleteProbeModal",

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
      loading: false
    };
  },

  computed: {
    title() {
      return this.probe.meta["File:Title"] || this.probe.meta["File:FileName"];
    }
  },

  methods: {
    ...mapActions(["deleteProbe"]),

    async doDelete() {
      this.loading = true;

      try {
        await this.deleteProbe(this.probe.id);
        this.$emit("delete");
      } finally {
        this.loading = false;
        this.close();
      }
    },

    close() {
      this.$emit("update:active", false);
    }
  }
};
</script>
