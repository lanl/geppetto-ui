<template>
  <div class="collapsible tag-group active">
    <div class="header has-background-primary">
      <h1>Tags</h1>
    </div>
    <div class="content active is-fullwidth">
      <div class="field has-addons">
        <div class="control">
          <TagInput placeholder="Add tags" v-model="tagsToAdd" />
        </div>
        <div class="control">
          <button class="button is-primary" @click="addTags">Add</button>
        </div>
      </div>
      <div class="tags">
        <span class="tag is-light is-medium" v-for="t in tags" :key="t">
          {{ t }}
          <button class="delete" @click="deleteTag(t)"></button>
        </span>
      </div>
    </div>
    <!--

      -->
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import * as probeService from "../services/ProbeService.js";

import TagInput from "../common/TagInput.vue";

export default {
  name: "Tags",

  components: {
    TagInput
  },

  data: function() {
    return {
      tagsToAdd: []
    };
  },
  methods: {
    ...mapMutations(["invalidateProbes", "invalidateTagCounts", "showError"]),
    ...mapActions(["fetchTagCounts", "selectProbe"]),

    addTags() {
      if (this.tagsToAdd.length === 0) {
        return;
      }

      // add tags
      this.updateTags(
        this.probe.id,
        [...this.tags, ...this.tagsToAdd].join(",")
      );

      //clear
      this.tagsToAdd = [];
    },
    deleteTag(tag) {
      this.removeTag(this.probe.id, tag);
    },
    updateProbe: function() {
      // update store changes
      this.invalidateTagCounts();
      this.selectProbe({ probe: this.probe });
      // update gallery with added tags
      this.invalidateProbes();
    },
    updateTags(id, tags) {
      probeService
        .updateTags(id, tags)
        .then(() => {
          this.updateProbe();
        })
        .catch(err => {
          this.showError(err);
        });
    },
    removeTag(id, tag) {
      probeService
        .deleteTag(id, tag)
        .then(() => {
          this.updateProbe();
        })
        .catch(err => {
          this.showError(err);
        });
    }
  },
  computed: {
    ...mapState({
      probe: state => state.pipeline.probe
    }),

    tags() {
      if (!this.probe || !this.probe.user_tags) {
        return [];
      }

      return Object.keys(this.probe.user_tags).sort();
    }
  },

  created() {
    this.fetchTagCounts();
  }
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";
.vcontainer {
  height: 100% !important;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 4px;
}
.collapsible {
  flex-basis: 40px;
  flex-grow: 0;
  transition: 0.5s;
  overflow: hidden;
}
.collapsible.active {
  flex-basis: auto;
  max-height: 50%;
}
.collapsible.tag-group.active {
  flex-basis: auto;
}
.columns {
  overflow-x: hidden;
  overflow-y: auto;
  visibility: visible;
  transition: 0.4s;
}
.columns.hidden {
  max-height: 0;
  visibility: hidden;
}
.column {
  padding: 4px;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.header {
  height: 40px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  font-size: 1.05em;
  transition: 0.3s;
  border-bottom: 1px solid #ccc;
  border-top: 1px solid #ccc;
}
.header h1 {
  font-weight: 800;
}
.header .columns {
  width: 100%;
}
.header .columns .column {
  margin-top: 14px;
}
.content .header {
  height: 35px;
  background: $light;
  color: $grey;
  font-weight: 600 !important;
}
.content .header:hover {
  background: #f0f0f0;
  color: $grey-dark;
}
.float-icon {
  position: relative;
  right: 6px;

  font-size: 16px;
}
.collapsible .content {
  max-height: 0;
  padding: 8px;
  overflow: hidden;
}
.content h4 {
  margin: 0;
}
.collapsible .content.active {
  max-height: 100%;
  overflow: auto;
}
.content.meta.active {
  display: block;
  background: white;
  padding: 3px;
  padding-bottom: 40px;
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 100%;
}
.analytics {
  padding: 3px;
  flex: 1;
  overflow: auto;
}

.field {
  width: 100%;
}
.control:first-of-type {
  flex: 1 1 auto;
  max-width: 100%;
}
</style>
