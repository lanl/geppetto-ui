<template>
  <div
    class="dropdown is-right is-up"
    :class="{ 'is-active': active }"
    @click="active = !active"
  >
    <div class="dropdown-trigger">
      <button class="button">
        <span class="icon is-small">
          <font-awesome-icon icon="cog" />
        </span>
      </button>
    </div>
    <div class="dropdown-menu">
      <div class="dropdown-content">
        <div class="dropdown-item has-text-weight-bold">Playback Rate</div>
        <hr class="dropdown-divider" />
        <a
          v-for="rate in playbackRates"
          :key="rate"
          href="#"
          class="dropdown-item"
          :class="{ 'is-active': rate === playbackRate }"
          @click="$emit('update:playbackRate', rate)"
          >{{ rate === 1 ? "Normal" : rate }}</a
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlaybackRateControl",

  props: {
    playbackRate: {
      type: Number,
      default: 1
    }
  },

  data() {
    return {
      active: false,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    };
  }
};
</script>
