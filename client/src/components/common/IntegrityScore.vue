<template>
  <span>
    {{ formattedScore }}
  </span>
</template>

<script>
export default {
  props: {
    score: { type: Number },
    format: { type: String, default: "integrity" }
  },
  computed: {
    formattedScore() {
      const percent = new Intl.NumberFormat(undefined, { style: "percent" });

      if (this.score === undefined) {
        return "Not Calculated";
      }

      if (this.score === -1) return "Opted out of score";

      const format = this.format.toLowerCase();
      let result = "";

      result =
        format === "integrity"
          ? percent.format(1 - this.score)
          : format === "percent"
          ? percent.format(this.score)
          : this.score;

      return result;
    }
  }
};
</script>

<style></style>
