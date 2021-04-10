<template>
  <b-taginput
    ref="tagInput"
    v-bind="$attrs"
    v-on="$listeners"
    autocomplete
    :allow-new="true"
    :append-to-body="true"
    :create-tag="createTag"
    :data="filteredTags"
    @blur="$refs.tagInput.addTag()"
    @typing="filter = $event"
  />
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "TagInput",

  data() {
    return {
      filter: ""
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
    },

    filteredTags() {
      return this.tags.filter(tag => tag.includes(this.filter.toLowerCase()));
    }
  },

  methods: {
    createTag(tag) {
      return tag.replace(/ /g, "").toLowerCase();
    }
  }
};
</script>
