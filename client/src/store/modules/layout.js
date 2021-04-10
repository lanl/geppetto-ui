// Layout module handles which components to show
// active selections, toggles, and other layout state vars
import * as cGradient from "@/helpers/colorGradients";

const state = {
  analyticSortDir: -1, // 1 asc, -1 desc
  analyticSortField: "score", // "name" or "score"
  galleryMode: "grid", // grid | table
  galleryScrollPosition: 0,
  selectedMenu: "", // "" | Upload | Filters | Settings
  maskOpacity: 0.75, // 0-1 opacity sliders linked here
  maskThreshold: 0.5, // similar to opacity
  colormap: cGradient.spectral, // default greyscale
  showScoreAnnotations: true
};

const getters = {
  analyticSortDir: state => state.analyticSortDir,
  analyticSortField: state => state.analyticSortField,
  selectedMenu: state => state.selectedMenu,
  maskOpacity: state => state.maskOpacity,
  maskThreshold: state => state.maskThreshold,
  colormap: state => state.colormap,
  baseUri: () =>
    window.location.hostname == "localhost"
      ? "http://" + window.location.hostname + ":3000"
      : ""
};

const mutations = {
  setAnalyticSortDir(state, dir) {
    state.analyticSortDir = dir;
  },
  setAnalyticSortField(state, field) {
    if (["score", "name", "mask"].indexOf(field) >= 0)
      state.analyticSortField = field;
    else console.error("Invalid sort field name");
  },

  setGalleryMode(state, galleryMode) {
    state.galleryMode = galleryMode;
  },

  setGalleryScrollPosition(state, galleryScrollPosition) {
    state.galleryScrollPosition = galleryScrollPosition;
  },

  selectMenu(state, menu) {
    if (state.selectedMenu === menu) {
      state.selectedMenu = "";
      return;
    }
    var validMenus = [
      "Upload",
      "Filters",
      "Settings",
      "Download",
      "Import",
      "Fusion"
    ];
    if (validMenus.indexOf(menu) >= 0) {
      state.selectedMenu = menu;
    } else if (menu === "") {
      state.selectedMenu = "";
    } else {
      console.error("Invalid Menu: " + menu);
    }
  },
  setOpacity(state, op) {
    state.maskOpacity = op;
  },

  selectColormap(state, map) {
    const maps = [
      "greyscale",
      "invertedgreyscale",
      "cividis",
      "viridis",
      "inferno",
      "spectral"
    ];

    state.colormap = maps.includes(map) ? cGradient[map] : cGradient[maps[0]];
  },

  toggleShowScoreAnnotations(state) {
    state.showScoreAnnotations = !state.showScoreAnnotations;
  }
};

export default {
  state,
  getters,
  mutations
};
