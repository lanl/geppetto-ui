<template>
  <table class="table is-fullwidth" style="table-layout: fixed">
    <thead>
      <tr>
        <th style="width: 30%">Analytic</th>
        <th style="width: 10%">Pending</th>
        <th style="width: 10%">Running</th>
        <th style="width: 10%">Succeeded</th>
        <th style="width: 10%">Opted Out</th>
        <th style="width: 10%">Failed</th>
        <th style="width: 20%"></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total</td>
        <td>{{ totalPending }}</td>
        <td>{{ totalRunning }}</td>
        <td>{{ totalSucceeded }}</td>
        <td>{{ totalOptedOut }}</td>
        <td>{{ totalFailed }}</td>
        <td style="vertical-align: middle">
          <AnalyticStatsBar
            :pending="totalPending"
            :running="totalRunning"
            :succeeded="totalSucceeded"
            :optedOut="totalOptedOut"
            :failed="totalFailed"
          />
        </td>
      </tr>
      <tr
        v-for="analytic in analytics"
        :key="analytic.id"
        :class="{
          'has-background-info-light': analytic.running > 0
        }"
      >
        <td>{{ analytic.name }}</td>
        <td>{{ analytic.pending }}</td>
        <td>{{ analytic.running }}</td>
        <td>{{ analytic.succeeded }}</td>
        <td>{{ analytic.opted_out }}</td>
        <td>{{ analytic.failed }}</td>
        <td style="vertical-align: middle">
          <AnalyticStatsBar
            :pending="analytic.pending"
            :running="analytic.running"
            :succeeded="analytic.succeeded"
            :optedOut="analytic.opted_out"
            :failed="analytic.failed"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import AnalyticStatsBar from "./AnalyticStatsBar.vue";

export default {
  name: "AnalyticStatsTable",

  components: {
    AnalyticStatsBar
  },

  props: {
    analytics: {
      type: Array,
      required: true
    }
  },

  computed: {
    totalPending() {
      return this.analytics.map(a => a.pending).reduce((a, b) => a + b, 0);
    },

    totalRunning() {
      return this.analytics.map(a => a.running).reduce((a, b) => a + b, 0);
    },

    totalSucceeded() {
      return this.analytics.map(a => a.succeeded).reduce((a, b) => a + b, 0);
    },

    totalOptedOut() {
      return this.analytics.map(a => a.opted_out).reduce((a, b) => a + b, 0);
    },

    totalFailed() {
      return this.analytics.map(a => a.failed).reduce((a, b) => a + b, 0);
    }
  }
};
</script>
