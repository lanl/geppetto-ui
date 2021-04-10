<template>
  <div class="select">
    <select title="Score probes by" v-model="scoreSourceModel">
      <optgroup label="Fusions">
        <option value="">(None)</option>
        <option
          v-for="analytic in sortedFusersWithScores"
          :key="analytic.id"
          :value="analytic.id"
          >{{ analytic.name }}</option
        >
      </optgroup>
      <optgroup
        v-if="sortedImageAnalyticsWithScores.length"
        label="Image Analytics"
      >
        <option
          v-for="analytic in sortedImageAnalyticsWithScores"
          :key="analytic.id"
          :value="analytic.id"
          >{{ analytic.name }}</option
        >
      </optgroup>
      <optgroup
        v-if="sortedVideoAnalyticsWithScores.length"
        label="Video Analytics"
      >
        <option
          v-for="analytic in sortedVideoAnalyticsWithScores"
          :key="analytic.id"
          :value="analytic.id"
          >{{ analytic.name }}</option
        >
      </optgroup>
    </select>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "ScoreSourceSelect",

  computed: {
    ...mapState({
      scoreSource: state => state.filters.scoreSource
    }),

    ...mapGetters([
      "sortedImageAnalyticsWithScores",
      "sortedVideoAnalyticsWithScores",
      "sortedFusersWithScores"
    ]),

    scoreSourceModel: {
      get() {
        return this.scoreSource;
      },

      set(value) {
        this.setScoreSource(value);
      }
    }
  },

  methods: {
    ...mapActions(["fetchAnalyticsWithScores", "setScoreSource"])
  },

  created() {
    this.fetchAnalyticsWithScores();
  }
};
</script>
