<template>
  <svg class="is-unselectable" :viewBox="`0 0 ${width} ${height}`">
    <g :transform="`translate(${yAxisWidth}, ${yAxisPadding})`">
      <g class="y-axis">
        <g
          v-for="tick in ticks"
          :key="tick.value"
          :transform="`translate(0, ${tick.y})`"
        >
          <text
            class="y-axis-label"
            :x="-gap"
            dominant-baseline="central"
            text-anchor="end"
          >
            {{ tick.value }}
          </text>
        </g>

        <line class="axis-line" y1="0" :y2="chartHeight" />
      </g>

      <g class="x-axis" :transform="`translate(0, ${chartHeight})`">
        <g
          v-for="bar in bars"
          :key="bar.label"
          :transform="`translate(${bar.midPoint}, 0)`"
        >
          <text
            class="x-axis-label"
            :y="gap"
            dominant-baseline="hanging"
            text-anchor="middle"
          >
            {{ bar.label }}
          </text>
        </g>

        <line class="axis-line" x1="0" :x2="chartWidth" />
      </g>

      <g class="grid">
        <g
          v-for="tick in ticks"
          :key="tick.value"
          :transform="`translate(0, ${tick.y})`"
        >
          <line class="grid-line" x1="0" :x2="chartWidth" />
        </g>
      </g>

      <g class="bars">
        <g
          v-for="bar in bars"
          :key="bar.label"
          :transform="`translate(${bar.x}, 0)`"
        >
          <rect
            class="bar has-fill-primary"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
            @click="$emit('click', { index: bar.index })"
          >
            <title>Count: {{ bar.value }}</title>
          </rect>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
import { scaleBand, scaleLinear } from "d3-scale";

export default {
  name: "BarChart",

  props: {
    data: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      chartWidth: 600,
      chartHeight: 400,
      gap: 5,
      xAxisHeight: 20,
      yAxisPadding: 10
    };
  },

  computed: {
    width() {
      return this.chartWidth + this.yAxisWidth;
    },

    height() {
      return this.chartHeight + this.xAxisHeight + this.yAxisPadding;
    },

    yAxisWidth() {
      return this.maxValue.toString().length * 8 + this.gap;
    },

    ticks() {
      return this.y.ticks().map(value => ({
        value,
        y: this.y(value)
      }));
    },

    bars() {
      return this.data.map(({ label, value }, index) => ({
        index,
        label,
        value,
        x: this.x(label),
        midPoint: this.x(label) + this.x.bandwidth() / 2,
        y: this.y(value),
        width: this.x.bandwidth(),
        height: this.chartHeight - this.y(value)
      }));
    },

    x() {
      return scaleBand()
        .domain(this.data.map(({ label }) => label))
        .padding(0.2)
        .rangeRound([0, this.chartWidth]);
    },

    y() {
      return scaleLinear()
        .domain([0, this.maxValue])
        .nice()
        .range([this.chartHeight, 0]);
    },

    maxValue() {
      const maxValue = Math.max(...this.data.map(({ value }) => value));

      if (!Number.isFinite(maxValue) || maxValue === 0) {
        return 10;
      }

      return Math.ceil(maxValue / 10) * 10;
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";

.x-axis-label,
.y-axis-label {
  fill: $text;
  font: 10px $family-sans-serif;
}

.axis-line {
  stroke: $grey-lighter;
  stroke-width: 2px;
}

.grid-line {
  stroke: $grey-lightest;
}

.bar {
  cursor: pointer;
}
</style>
