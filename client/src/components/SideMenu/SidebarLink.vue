<template>
  <router-link
    class="sidebar-link has-text-white"
    active-class="has-text-primary"
    :to="to"
  >
    <font-awesome-icon :icon="icon" size="lg" />
    <p class="is-size-7 has-text-weight-bold margin">{{ title }}</p>
    <progress
      class="progress is-tiny is-success"
      :class="{ 'is-invisible': !showProgress }"
      :value="progress"
      :max="total"
    ></progress>
  </router-link>
</template>

<script>
export default {
  name: "SidebarLink",

  props: {
    title: {
      type: String,
      required: true
    },

    icon: {
      type: [String, Array],
      required: true
    },

    to: {
      type: [String, Object],
      required: true
    },

    showProgress: {
      type: Boolean,
      default: false
    },

    progress: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.sidebar-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 8px;
}

.margin {
  margin: 4px;
}

.progress.is-tiny {
  width: 80px;
  height: 4px;
}
</style>
