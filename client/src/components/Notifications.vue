<template>
  <div class="notifications">
    <div class="container">
      <transition
        enter-active-class="animate__animated animate__faster animate__slideInDown"
        leave-active-class="animate__animated animate__faster animate__fadeOut"
      >
        <div v-if="error" class="notification box is-danger">
          <button class="delete" @click="clearError"></button>
          <div v-html="error"></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "Notifications",

  computed: {
    ...mapState({
      error: state => state.notifications.error
    })
  },

  methods: {
    ...mapMutations(["clearError"])
  }
};
</script>

<style>
.notifications {
  padding: 1.5rem;
  pointer-events: none;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.notifications .notification {
  pointer-events: initial;
}
</style>
