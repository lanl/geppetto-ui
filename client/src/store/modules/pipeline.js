// Pipeline module handles probe data coming and going to the pipe
// selected probe/masks, data from probe, tags, all probes, etc
// if it calls the pipeline, it goes here.
import * as probeService from "@/components/services/ProbeService";

const state = {
  probe: null,
  selectedAnalytic: "",
  maskUrl: "",
  fusionModel: "ta2-combo",
  uploadTotal: Number,
  uploadProgress: Number,
  analyticList: {
    imageAnalytics: [],
    videoAnalytics: [],
    fusers: []
  },
  facetInfo: {}
};

const getters = {
  analyticList: state => state.analyticList,

  facetInfo: state => state.facetInfo,

  getFriendly: state => id => {
    const lst = [
      ...state.analyticList.imageAnalytics,
      ...state.analyticList.videoAnalytics,
      ...state.analyticList.fusers
    ];

    return lst.find(a => a.id === id);
  },

  probe: state => state.probe,

  imageSelected: state => {
    return (
      state.probe &&
      state.probe.analytic_info &&
      state.probe.analytic_info.length > 1 &&
      state.probe.analytic_info[0].detection.img_manip !== undefined
    );
  },

  maskUrl: state => state.maskUrl,

  meta: state => {
    return state.probe && state.probe.meta;
  },

  selectedAnalytic: state => state.selectedAnalytic,

  uploadTotal: state => state.uploadTotal,
  uploadProgress: state => state.uploadProgress,
  fusionModel: state => state.fusionModel
};

const mutations = {
  unselectAll(state) {
    state.probe = null;
  },
  selectProbe(state, probe) {
    if (state.probe !== null && state.probe.id === probe.id) {
      state.probe = probe;
      return;
    }
    state.probe = probe;
    // reset analytic data
    state.selectedAnalytic = "";
    state.maskUrl = "";
  },
  clearProbe(state) {
    state.probe = null;
    state.selectAnalytic = "";
    state.maskUrl = "";
  },
  setAnalyticList(state, aList) {
    state.analyticList = aList;

    if (aList.fusers.length !== 0) {
      state.fusionModel = aList.fusers[0].id;
    }
  },
  setFacetInfo(state, info) {
    state.facetInfo = info;
  },
  selectMask(state, url) {
    state.maskUrl = url;
  },
  selectAnalytic(state, name) {
    state.selectedAnalytic = name;
  },
  resetAll(state) {
    state.probe = null;
  },
  //upload visuals
  resetUpload(state) {
    state.uploadTotal = 0;
    state.uploadProgress = 0;
  },
  setUploadTotal(state, total) {
    state.uploadTotal = total;
    state.uploadProgress = 0;
  },
  setUploadProgress(state, prog) {
    state.uploadProgress = prog;
  },
  setFusionModel(state, fusionModel) {
    state.fusionModel = fusionModel;
  }
};

const actions = {
  fetchAnalyticList: async context => {
    try {
      var list = await probeService.getAnalyticList();
      context.commit("setAnalyticList", list.data);
    } catch (error) {
      context.commit("showError", error);
    }
  },
  fetchFacetInfo: async context => {
    try {
      var info = await probeService.getFacetInfo();
      context.commit("setFacetInfo", info.data);
    } catch (error) {
      context.commit("showError", error);
    }
  },
  selectProbe: async (context, payload) => {
    try {
      // update info from probe
      let updatedInfo = await probeService.probeInfo(
        payload.probe.id,
        payload.include_fused
      );

      context.commit("selectProbe", updatedInfo.data); //.detections[0]
    } catch (error) {
      context.commit("showError", error);
    }
  },
  async updateProbeMetadata({ commit, state }, metadata) {
    try {
      const res = await probeService.updateMetadata(state.probe.id, metadata);
      commit("selectProbe", res.data);
    } catch (error) {
      commit("showError", error);
      throw error;
    }
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
