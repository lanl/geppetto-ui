import Vue from "vue";
import Vuex from "vuex";

import analytics from "./modules/analytics";
import bookmarks from "./modules/bookmarks";
import filters from "./modules/filters";
import layout from "./modules/layout";
import notifications from "./modules/notifications";
import pipeline from "./modules/pipeline";
import probes from "./modules/probes";
import rerunAnalytics from "./modules/rerunAnalytics";
import tags from "./modules/tags";
import upload from "./modules/upload";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    analytics,
    bookmarks,
    filters,
    layout,
    notifications,
    pipeline,
    probes,
    rerunAnalytics,
    tags,
    upload
  }
});

export default store;

window.addEventListener("beforeunload", e => {
  if (store.state.upload.isUploading) {
    e.preventDefault();
    e.returnValue = "";
  }
});
