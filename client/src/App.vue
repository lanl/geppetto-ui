<template>
  <div id="app">
    <Navbar />

    <div class="columns is-fullheight is-mobile">
      <aside class="column is-narrow">
        <Sidebar />
      </aside>

      <div class="column">
        <router-view></router-view>
      </div>
    </div>

    <Notifications />
  </div>
</template>

<script>
import { mapActions } from "vuex";

import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/SideMenu/Sidebar.vue";
import Notifications from "./components/Notifications.vue";

export default {
  name: "App",

  components: {
    Navbar,
    Sidebar,
    Notifications
  },

  methods: {
    ...mapActions(["fetchAnalyticList", "fetchFacetInfo"])
  },

  created() {
    this.fetchAnalyticList();
    this.fetchFacetInfo();
  }
};
</script>

<style scoped>
#app {
  height: 100vh !important;
}

.columns.is-fullheight {
  height: calc(100vh - 3.25rem);
}

.column {
  height: 100%;
  overflow: auto;
  transition: 0s;
  padding: 0;
}

.column.is-one-third {
  transition: 0.35s;
}

.column:first-child {
  padding: 0px;
}
</style>
