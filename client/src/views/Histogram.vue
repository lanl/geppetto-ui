<template>
  <div class="histogram">
    <header>
      <div class="toolbar">
        <ScoreSourceSelect />
      </div>
    </header>

    <main class="bar-chart-container is-relative">
      <BarChart class="bar-chart" :data="data" @click="selectBucket" />
      <b-loading :active="loading" :is-full-page="false" />
    </main>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";

import BarChart from "@/components/common/BarChart.vue";
import ScoreSourceSelect from "@/components/common/ScoreSourceSelect.vue";
import { getHistogram } from "@/components/services/ProbeService";

export default {
  name: "Histogram",

  components: {
    BarChart,
    ScoreSourceSelect
  },

  data() {
    return {
      histogram: [],
      loading: false
    };
  },

  computed: {
    ...mapState({ filters: state => state.filters }),

    data() {
      return this.histogram.map((bucket, i) => ({
        label: `≤${(i + 1) * 10}%`,
        value: bucket.frequency
      }));
    }
  },

  methods: {
    ...mapMutations(["showError"]),
    ...mapActions(["setScoreFilter", "setScoreFilterEnabled"]),

    selectBucket(e) {
      const bucket = this.histogram[e.index];

      if (bucket) {
        this.setScoreFilter([bucket.min, bucket.max]);
        this.setScoreFilterEnabled(true);
        this.$router.push("/probes");
      }
    },

    async fetchHistogram() {
      this.loading = true;

      try {
        this.histogram = await getHistogram();
      } catch (err) {
        this.showError(err);
      } finally {
        this.loading = false;
      }
    }
  },

  watch: {
    filters: {
      handler() {
        this.fetchHistogram();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
.histogram {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.histogram main {
  flex: auto;
  overflow: auto;
}

.bar-chart-container {
  width: 100%;
  height: calc(100vh - 8rem);
  padding: 1em;
}

.bar-chart {
  width: 100%;
  max-height: 100%;
}
</style>
