<template>
  <div class="full-side dark">
    <div class="static-side">
      <SidebarLink title="Gallery" icon="photo-video" to="/probes" />
      <SidebarLink title="Histogram" icon="chart-bar" to="/histogram" />
      <SidebarLink
        title="Upload"
        icon="upload"
        to="/upload"
        :showProgress="isUploading"
        :progress="progress"
        :total="total"
      />
      <SidebarLink title="Analytics" icon="cog" to="/analytics" />
      <SidebarLink title="Bookmarks" icon="bookmark" to="/bookmarks" />
      <SidebarIcon
        title="Filters"
        icon="filter"
        :isActive="expanded"
        @click="expanded = !expanded"
      />
    </div>
    <div class="expanding-side" :class="{ active: expanded }">
      <!-- Individual expandable Components here-->
      <keep-alive>
        <SidebarFilters v-if="expanded" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import SidebarFilters from "./SidebarFilters.vue";
import SidebarIcon from "./SidebarIcon.vue";
import SidebarLink from "./SidebarLink.vue";

export default {
  name: "Sidebar",

  components: {
    SidebarFilters,
    SidebarIcon,
    SidebarLink
  },

  data() {
    return {
      expanded: false
    };
  },

  computed: {
    ...mapState({
      isUploading: state => state.upload.isUploading,
      progress: state => state.upload.progress,
      total: state => state.upload.total
    })
  }
};
</script>

<style scoped lang="scss">
.full-side {
  position: relative;
  height: 100%;
  width: auto;
  overflow: hidden;
}
.static-side {
  height: 100%;
  padding-right: 6px;
  float: left;
  border-right: 1px solid #444;
}
.expanding-side {
  float: left;
  height: 100%;
  visibility: collapse;
  width: 0px;
  transition: visibility 200ms, width 200ms;
  transition: padding none;
}
.expanding-side.active {
  width: 280px;

  visibility: visible;
}
</style>
