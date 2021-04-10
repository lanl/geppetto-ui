<template>
  <div class="analytics">
    <header>
      <div class="toolbar">
        <button
          class="button"
          @click="runNewAnalytics()"
          :disabled="rerunIsInProgress"
        >
          Run New Analytics
        </button>

        <button
          class="button"
          @click="runNewFusers()"
          :disabled="rerunIsInProgress"
        >
          Run New Fusers
        </button>

        <button
          class="button is-danger"
          @click="rerunFailedAnalytics()"
          :disabled="rerunIsInProgress"
        >
          Rerun Failed Analytics
        </button>
      </div>

      <progress
        v-if="rerunIsInProgress"
        class="progress is-success is-tiny is-radiusless"
        :value="rerunCompleted"
        :max="rerunTotal"
      />
    </header>

    <main>
      <section class="section">
        <div class="container">
          <h1 class="title">Image Analytics</h1>
          <AnalyticStatsTable
            v-if="imageAnalytics.length"
            :analytics="sortedImageAnalytics"
          />
          <p v-else-if="loading" class="table-message">Loading...</p>
          <p v-else class="table-message">No tasks</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h1 class="title">Video Analytics</h1>
          <AnalyticStatsTable
            v-if="videoAnalytics.length"
            :analytics="sortedVideoAnalytics"
          />
          <p v-else-if="loading" class="table-message">Loading...</p>
          <p v-else class="table-message">No tasks</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h1 class="title">Fusion</h1>
          <AnalyticStatsTable v-if="fusers.length" :analytics="sortedFusers" />
          <p v-else-if="loading" class="table-message">Loading...</p>
          <p v-else class="table-message">No tasks</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { List } from "immutable";
import { mapActions, mapMutations, mapState } from "vuex";

import { getAnalyticStats } from "../services/ProbeService";

import AnalyticStatsTable from "./AnalyticStatsTable.vue";

const DELAY = 10000;

export default {
  name: "Analytics",

  components: {
    AnalyticStatsTable
  },

  data() {
    return {
      imageAnalytics: [],
      videoAnalytics: [],
      fusers: [],
      loading: false
    };
  },

  computed: {
    ...mapState({
      rerunIsInProgress: state => state.rerunAnalytics.isInProgress,
      rerunCompleted: state => state.rerunAnalytics.completed,
      rerunTotal: state => state.rerunAnalytics.total
    }),

    sortedImageAnalytics() {
      return List(this.imageAnalytics)
        .sortBy(a => a.name || a.id)
        .toArray();
    },

    sortedVideoAnalytics() {
      return List(this.videoAnalytics)
        .sortBy(a => a.name || a.id)
        .toArray();
    },

    sortedFusers() {
      return List(this.fusers)
        .sortBy(f => f.name || f.id)
        .toArray();
    }
  },

  methods: {
    ...mapMutations(["showError"]),
    ...mapActions(["runNewAnalytics", "runNewFusers", "rerunFailedAnalytics"]),

    async fetchAnalyticStats() {
      this.loading = true;

      try {
        const {
          imageAnalytics,
          videoAnalytics,
          fusers
        } = await getAnalyticStats();

        this.imageAnalytics = imageAnalytics;
        this.videoAnalytics = videoAnalytics;
        this.fusers = fusers;
      } catch (error) {
        this.showError(error);
      } finally {
        this.loading = false;
      }
    },

    async update() {
      await this.fetchAnalyticStats();
      this.timeoutId = setTimeout(() => this.update(), DELAY);
    }
  },

  async created() {
    await this.update();
  },

  beforeDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
};
</script>

<style scoped>
.analytics {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.analytics main {
  flex: auto;
  overflow: auto;
}

.table-message {
  padding: 8px 12px;
}
</style>
