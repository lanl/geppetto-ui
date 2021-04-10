<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Tag Probes</p>
      </header>

      <section class="modal-card-body">
        <div class="field">
          <label class="label">Tags to Add</label>
          <div class="control">
            <b-taginput
              :allow-new="true"
              :value="tagsToAdd"
              @input="updateTagsToAdd"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Tags to Remove</label>
          <div class="control">
            <div class="select is-multiple is-fullwidth">
              <select multiple v-model="tagsToRemove">
                <option v-for="tag in tags" :key="tag" :value="tag">{{
                  tag
                }}</option>
              </select>
            </div>
          </div>
          <p class="help">
            Hold Control or Command to select multiple tags
          </p>
        </div>
      </section>

      <footer class="modal-card-foot">
        <button
          class="button is-primary"
          :class="{ 'is-loading': loading }"
          @click="tagProbes"
        >
          Tag Probes
        </button>
        <button class="button" @click="close">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "TagProbes",

  props: {
    active: Boolean
  },

  data() {
    return {
      tagsToAdd: [],
      tagsToRemove: [],
      loading: false
    };
  },

  computed: {
    ...mapState({
      tagCounts: state => state.tags.tagCounts
    }),

    tags() {
      return Object.keys(this.tagCounts.user_tag_counts)
        .map(tag => tag.split("=")[0])
        .sort();
    }
  },

  methods: {
    ...mapActions(["tagSelectedProbes", "fetchTagCounts"]),

    updateTagsToAdd(tagsToAdd) {
      this.tagsToAdd = tagsToAdd.map(tag =>
        tag.replace(/ /g, "").toLowerCase()
      );
    },

    async tagProbes() {
      this.loading = true;

      try {
        await this.tagSelectedProbes({
          tagsToAdd: this.tagsToAdd,
          tagsToRemove: this.tagsToRemove
        });
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
    active: {
      handler(active) {
        if (active) {
          this.tagsToAdd = [];
          this.tagsToRemove = [];
          this.fetchTagCounts();
        }
      }
    }
  }
};
</script>
