<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Delete Probes</p>
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
              Are you sure you want to delete the selected probes? This action
              cannot be undone.
            </p>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-danger"
          :class="{ 'is-loading': loading }"
          @click="deleteProbes"
        >
          Delete Probes
        </button>
        <button class="button" @click="close">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "DeleteProbes",

  props: {
    active: Boolean
  },

  data() {
    return {
      loading: false
    };
  },

  methods: {
    ...mapActions(["deleteSelectedProbes"]),

    async deleteProbes() {
      this.loading = true;

      try {
        await this.deleteSelectedProbes();
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
