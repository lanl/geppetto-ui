<template>
  <a
    class="sidebar-icon has-text-white"
    :class="{ 'has-text-primary': isActive }"
    @click="$emit('click')"
  >
    <font-awesome-layers class="fa-lg">
      <font-awesome-icon :icon="icon" />
      <font-awesome-icon icon="caret-right" transform="right-12 shrink-4" />
    </font-awesome-layers>
    <p class="is-size-7 has-text-weight-bold margin">{{ title }}</p>
  </a>
</template>

<script>
export default {
  name: "SidebarIcon",

  props: {
    title: {
      type: String,
      required: true
    },

    icon: {
      type: [String, Array],
      required: true
    },

    isActive: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="scss">
.sidebar-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 8px;
}

.margin {
  margin: 4px;
}
</style>
