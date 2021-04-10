import axios from "axios";

export default {
  state: {
    tagCounts: {
      tag_counts: {},
      user_tag_counts: {}
    },
    tagCountsAreValid: false
  },

  mutations: {
    setTagCounts(state, tagCounts) {
      state.tagCounts = tagCounts;
      state.tagCountsAreValid = true;
    },

    invalidateTagCounts(state) {
      state.tagCountsAreValid = false;
    }
  },

  actions: {
    async fetchTagCounts({ state, commit }) {
      if (state.tagCountsAreValid) {
        return;
      }

      try {
        const { data } = await axios.get("/tags");
        commit("setTagCounts", data);
      } catch (error) {
        commit("showError", error);
      }
    }
  }
};
