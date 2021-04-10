import axios from "axios";

import {
  deleteFailedAnalytics,
  getAllProbeIds,
  rerunProbeAnalytics
} from "@/components/services/ProbeService";

export default {
  state: {
    isInProgress: false,
    completed: undefined,
    total: 0
  },

  mutations: {
    setIsInProgress(state, isInProgress) {
      state.isInProgress = isInProgress;
    },

    setCompleted(state, completed) {
      state.completed = completed;
    },

    setTotal(state, total) {
      state.total = total;
    }
  },

  actions: {
    async runNewAnalytics({ commit }) {
      commit("setIsInProgress", true);
      commit("setCompleted", undefined);
      commit("setTotal", 0);

      try {
        const probeIds = await getAllProbeIds();

        commit("setCompleted", 0);
        commit("setTotal", probeIds.length);

        for (const [i, probeId] of probeIds.entries()) {
          await rerunProbeAnalytics(probeId);
          commit("setCompleted", i + 1);
        }
      } catch (error) {
        commit("showError", error);
      } finally {
        commit("setIsInProgress", false);
      }
    },

    async runNewFusers({ commit }) {
      commit("setIsInProgress", true);

      try {
        await axios.post("/fuse");
      } catch (error) {
        commit("showError", error);
      } finally {
        commit("setIsInProgress", false);
      }
    },

    async rerunFailedAnalytics({ commit }) {
      commit("setIsInProgress", true);
      commit("setCompleted", undefined);
      commit("setTotal", 0);

      try {
        const { deleted_analytics } = await deleteFailedAnalytics();
        const probeIds = Object.keys(deleted_analytics);

        commit("setCompleted", 0);
        commit("setTotal", probeIds.length);

        for (const [i, probeId] of probeIds.entries()) {
          await rerunProbeAnalytics(probeId);
          commit("setCompleted", i + 1);
        }
      } catch (error) {
        commit("showError", error);
      } finally {
        commit("setIsInProgress", false);
      }
    }
  }
};
