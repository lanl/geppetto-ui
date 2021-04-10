import axios from "axios";
import { saveAs } from "file-saver";

const state = {
  probes: [],
  probesAreValid: false,
  nextPageToken: "",
  total: 0,
  isLoading: false,
  selectedProbeIds: []
};

const getters = {
  downloadURL(state, getters) {
    const { baseUri, params } = getters;

    return (
      baseUri +
      axios.getUri({
        url: "/probes/download",
        params
      })
    );
  },

  csvURL(state, getters) {
    const { baseUri, params } = getters;

    return (
      baseUri +
      axios.getUri({
        url: "/probes/csv",
        params
      })
    );
  },

  jsonURL(state, getters) {
    const { baseUri, params } = getters;

    return (
      baseUri +
      axios.getUri({
        url: "/probes/json",
        params
      })
    );
  },

  isProbeSelected(state) {
    return probeId => {
      return state.selectedProbeIds.includes(probeId);
    };
  },

  selectedProbeCount(state) {
    return state.selectedProbeIds.length;
  },

  probeCount(state) {
    return state.total;
  }
};

const mutations = {
  setProbes(state, probes) {
    state.probes = probes;
    state.probesAreValid = true;
  },

  invalidateProbes(state) {
    state.probesAreValid = false;
  },

  setNextPageToken(state, nextPageToken) {
    state.nextPageToken = nextPageToken;
  },

  setTotal(state, total) {
    state.total = total;
  },

  setIsLoading(state, isLoading) {
    state.isLoading = isLoading;
  },

  selectAllProbes(state) {
    state.selectedProbeIds = state.probes.map(probe => probe.id);
  },

  selectProbe(state, { probeId, selected }) {
    const selectedProbeIds = new Set(state.selectedProbeIds);

    if (selected) {
      selectedProbeIds.add(probeId);
    } else {
      selectedProbeIds.delete(probeId);
    }

    state.selectedProbeIds = [...selectedProbeIds];
  },

  clearSelectedProbes(state) {
    state.selectedProbeIds = [];
  }
};

const actions = {
  async fetchProbes({ commit, getters }) {
    const { params } = getters;

    if (state.probesAreValid) {
      return;
    }

    commit("setIsLoading", true);

    try {
      const { data } = await axios.get("/probes", {
        params
      });

      commit("setProbes", data.detections);
      commit("setNextPageToken", data.page_token);
      commit("setTotal", data.total);
    } catch (error) {
      commit("showError", error);
    } finally {
      commit("setIsLoading", false);
    }
  },

  async fetchMoreProbes({ state, commit, getters }) {
    const { params } = getters;

    if (!state.nextPageToken) {
      return;
    }

    commit("setIsLoading", true);

    try {
      const probes = [...state.probes];

      const { data } = await axios.get("/probes", {
        params: {
          ...params,
          pagetoken: state.nextPageToken
        }
      });

      commit("setProbes", [...probes, ...data.detections]);
      commit("setNextPageToken", data.page_token);
      commit("setTotal", data.total);
    } catch (error) {
      commit("showError", error);
    } finally {
      commit("setIsLoading", false);
    }
  },

  async deleteProbe({ commit }, probeId) {
    try {
      await axios.delete(`/probes/${probeId}`);
      commit("invalidateProbes");
    } catch (error) {
      commit("showError", error);
      throw error;
    }
  },

  async downloadSelectedProbes({ commit, state }) {
    try {
      const { data } = await axios.post(
        "/probes/download",
        {
          probeIds: state.selectedProbeIds
        },
        { responseType: "blob" }
      );

      saveAs(data, "selected.zip");
    } catch (error) {
      commit("showError", error);
      throw error;
    }
  },

  async tagSelectedProbes({ commit, state }, { tagsToAdd, tagsToRemove }) {
    try {
      await axios.patch("/probes/tags", {
        probeIds: state.selectedProbeIds,
        tagsToAdd,
        tagsToRemove
      });

      commit("invalidateProbes");
      commit("invalidateTagCounts");
      commit("clearSelectedProbes");
    } catch (error) {
      commit("showError", error);
      throw error;
    }
  },

  async deleteSelectedProbes({ commit, state }) {
    try {
      await axios.delete("/probes", {
        data: {
          probeIds: state.selectedProbeIds
        }
      });

      commit("invalidateProbes");
      commit("invalidateTagCounts");
      commit("clearSelectedProbes");
    } catch (error) {
      commit("showError", error);
      throw error;
    }
  },

  seek() {
    // Do nothing
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
