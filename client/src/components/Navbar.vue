<template>
  <div>
    <nav
      class="navbar is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/">
          <strong>Geppetto</strong>
        </router-link>
      </div>
      <div class="navbar-menu">
        <div class="navbar-end">
          <a class="navbar-item" href="/help" target="_blank">Help</a>
          <a class="navbar-item" @click="aboutActive = true">About</a>
        </div>
      </div>
    </nav>

    <AboutModal :active.sync="aboutActive" />
  </div>
</template>

<script>
import AboutModal from "@/components/modals/AboutModal.vue";

export default {
  name: "Navbar",

  components: {
    AboutModal
  },

  data() {
    return {
      aboutActive: false
    };
  }
};
</script>

<style scoped>
.navbar .navbar-brand > a.navbar-item:hover {
  background-color: transparent;
}
</style>
