<template>
  <div class="bookmarks">
    <div class="media" v-for="bookmark in bookmarks" :key="bookmark.id">
      <div class="media-content">
        <div class="content">
          <strong
            ><a @click.prevent="seek(bookmark.time)">{{
              bookmark.time | duration(3)
            }}</a></strong
          >
          <p>{{ bookmark.comment }}</p>
        </div>
      </div>
      <div class="media-right">
        <button class="delete" @click="deleteBookmark(bookmark.id)"></button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import duration from "@/filters/duration";

export default {
  name: "ProbeBookmarks",

  props: {
    probeId: {
      type: String,
      required: true
    }
  },

  filters: {
    duration
  },

  computed: {
    ...mapState({
      bookmarks: state => state.bookmarks.bookmarks
    })
  },

  methods: {
    ...mapActions(["fetchBookmarks", "seek", "deleteBookmark"])
  },

  watch: {
    probeId: {
      handler() {
        this.fetchBookmarks(this.probeId);
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.bookmarks {
  background-color: white;
  height: 100%;
  overflow: auto;
  padding: 1rem 0.5rem;
}
</style>
