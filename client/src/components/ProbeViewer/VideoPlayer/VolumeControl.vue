<template>
  <div class="dropdown is-hoverable is-right is-up">
    <div class="dropdown-trigger">
      <button class="button" @click="$emit('update:muted', !muted)">
        <span class="icon is-small">
          <font-awesome-icon :icon="muted ? 'volume-mute' : 'volume-up'" />
        </span>
      </button>
    </div>
    <div class="dropdown-menu">
      <div class="dropdown-content">
        <div class="dropdown-item">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="volume"
            @input="$emit('update:volume', $event.target.valueAsNumber)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VolumeControl",

  props: {
    muted: {
      type: Boolean,
      default: false
    },

    volume: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
input[type="range"] {
  width: 100%;
}
</style>
