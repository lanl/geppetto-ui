<template>
  <div class="progress is-flex has-background-light">
    <div
      class="has-background-success"
      :style="{ width: (succeeded * 100) / total + '%' }"
    ></div>
    <div
      class="has-background-warning"
      :style="{ width: (optedOut * 100) / total + '%' }"
    ></div>
    <div
      class="has-background-danger"
      :style="{ width: (failed * 100) / total + '%' }"
    ></div>
    <div
      class="has-background-info"
      :style="{ width: (running * 100) / total + '%' }"
    ></div>
  </div>
</template>

<script>
export default {
  name: "AnalyticStatsBar",

  props: {
    pending: {
      type: Number,
      default: 0
    },
    running: {
      type: Number,
      default: 0
    },
    succeeded: {
      type: Number,
      default: 0
    },
    optedOut: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    }
  },

  computed: {
    total() {
      return (
        this.pending +
        this.running +
        this.succeeded +
        this.optedOut +
        this.failed
      );
    }
  }
};
</script>
