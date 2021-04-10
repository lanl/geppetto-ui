import axios from "axios";
import { List } from "immutable";

const state = {
  imageAnalyticsWithScores: [],
  videoAnalyticsWithScores: [],
  fusersWithScores: []
};

const getters = {
  isAnalyticId(state, getters) {
    const { imageAnalytics, videoAnalytics } = getters.analyticList;

    return analyticId =>
      imageAnalytics.some(analytic => analytic.id === analyticId) ||
      videoAnalytics.some(analytic => analytic.id === analyticId);
  },

  isFuserId(state, getters) {
    const { fusers } = getters.analyticList;

    return analyticId => fusers.some(analytic => analytic.id === analyticId);
  },

  sortedImageAnalyticsWithScores(state) {
    return List(state.imageAnalyticsWithScores)
      .sortBy(analytic => analytic.name)
      .toArray();
  },

  sortedVideoAnalyticsWithScores(state) {
    return List(state.videoAnalyticsWithScores)
      .sortBy(analytic => analytic.name)
      .toArray();
  },

  sortedFusersWithScores(state) {
    return List(state.fusersWithScores)
      .sortBy(analytic => analytic.name)
      .toArray();
  }
};

const mutations = {
  setAnalyticsWithScores(state, { imageAnalytics, videoAnalytics, fusers }) {
    state.imageAnalyticsWithScores = imageAnalytics;
    state.videoAnalyticsWithScores = videoAnalytics;
    state.fusersWithScores = fusers;
  }
};

const actions = {
  async fetchAnalyticsWithScores({ rootState, commit, dispatch }) {
    try {
      const { data } = await axios.get("/analytics/with-scores");
      commit("setAnalyticsWithScores", data);

      if (!rootState.filters.scoreSource && data.fusers[0]) {
        dispatch("setScoreSource", data.fusers[0].id);
      }
    } catch (error) {
      commit("showError", error);
    }
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
