<template>
  <div class="field">
    <div class="control has-icons-left has-icons-right">
      <input
        class="input"
        type="text"
        placeholder="Search"
        :value="metaQuery"
        @input="setMetaQuery($event.target.value)"
      />
      <span class="icon is-small is-left">
        <font-awesome-icon icon="search" />
      </span>
      <span
        class="icon is-small is-right is-clickable"
        v-show="metaQuery.length !== 0"
        @click="clearMetaQuery()"
      >
        <font-awesome-icon icon="times" />
      </span>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Search",

  computed: {
    ...mapState({
      metaQuery: state => state.filters.metaQuery
    })
  },

  methods: {
    ...mapActions(["setMetaQuery", "clearMetaQuery"])
  }
};
</script>
