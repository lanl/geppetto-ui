<template>
  <div class="analytic_card__header">
    <div class="analytic_card__name">{{ headerData.detectorName }}</div>
    <div class="analytic_card__indicator" v-if="headerData.status.completed">
      <font-awesome-icon
        v-if="!headerData.status.optedOut"
        :icon="headerData.iconFromScore"
        :class="headerData.classFromScore"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "DetectorHeader",
  props: {
    headerData: {}
  }
};
</script>

<style scoped>
.check {
  color: green;
}

.exclamation {
  color: orange;
}

.times {
  color: red;
}

.analytic_card__header {
  display: flex;
  justify-content: space-between;
}

.analytic_card__indicator {
  font-size: 1.2rem;
}

.analytic_card__name {
  font-size: 1rem;
  font-weight: 500;
  color: hsl(209, 15%, 28%);
  width: 90%;
}
</style>
