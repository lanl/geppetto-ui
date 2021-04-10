<template>
  <div class="bookmarks is-relative">
    <div class="container">
      <div class="media" v-for="bookmark in bookmarks" :key="bookmark.id">
        <figure class="media-left">
          <div class="image is-64x64">
            <img :src="`/input/thumbnails/${bookmark.probeId}.jpg`" />
          </div>
        </figure>
        <div class="media-content">
          <div class="content">
            <strong
              ><router-link
                :to="`/probes/${bookmark.probeId}?time=${bookmark.time}`"
                >{{ bookmark.time | duration(3) }}</router-link
              ></strong
            >
            <p>{{ bookmark.comment }}</p>
          </div>
        </div>
        <div class="media-right">
          <button class="delete" @click="deleteBookmark(bookmark.id)"></button>
        </div>
      </div>
    </div>

    <div v-if="!loading && bookmarks.length === 0" class="no-data">
      <font-awesome-icon icon="bookmark" size="2x" />
      <h2>No bookmarks</h2>
    </div>

    <b-loading :active="loading" :is-full-page="false"></b-loading>
  </div>
</template>

<script>
import axios from "axios";
import { mapMutations } from "vuex";
import duration from "@/filters/duration";

export default {
  name: "Bookmarks",

  filters: {
    duration
  },

  data() {
    return {
      bookmarks: [],
      loading: false
    };
  },

  methods: {
    ...mapMutations(["showError"]),

    async fetchBookmarks() {
      this.loading = true;

      try {
        const { data } = await axios.get("/bookmarks");
        this.bookmarks = data;
      } catch (error) {
        this.showError(error);
      } finally {
        this.loading = false;
      }
    },

    async deleteBookmark(id) {
      try {
        await axios.delete(`/bookmarks/${id}`);
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
      } catch (error) {
        this.showError(error);
      }
    }
  },

  created() {
    this.fetchBookmarks();
  }
};
</script>

<style scoped>
.bookmarks {
  height: 100%;
  padding: 1rem;
}

.bookmarks img {
  object-fit: cover;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 10rem;
}
</style>
