import Vue from "vue";
import VueRouter from "vue-router";

import Analytics from "@/components/Analytics/Analytics.vue";
import Bookmarks from "@/views/Bookmarks.vue";
import GalleryContainer from "@/components/Gallery/GalleryContainer.vue";
import Histogram from "@/views/Histogram.vue";
import ProbeContainer from "@/components/ProbeViewer/ProbeContainer.vue";
import Supplemental from "@/Supplemental.vue";
import UploadContainer from "@/components/Upload/UploadContainer.vue";

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "/probes",
      component: GalleryContainer
    },
    {
      path: "/probes/:probeId",
      component: ProbeContainer,
      props: true
    },
    {
      path: "/histogram",
      component: Histogram
    },
    {
      path: "/upload",
      component: UploadContainer
    },
    {
      path: "/analytics",
      component: Analytics
    },
    {
      path: "/bookmarks",
      component: Bookmarks
    },
    {
      path: "/supplemental",
      component: Supplemental,
      name: "supplemental"
    },
    {
      path: "/",
      redirect: "/probes"
    }
  ]
});
