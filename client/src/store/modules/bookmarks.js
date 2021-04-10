import axios from "axios";
import { List } from "immutable";

const state = {
  bookmarks: []
};

const mutations = {
  bookmarksFetched(state, bookmarks) {
    state.bookmarks = bookmarks;
  },

  bookmarkCreated(state, bookmark) {
    state.bookmarks = List([...state.bookmarks, bookmark])
      .sortBy(b => b.time)
      .toArray();
  },

  bookmarkDeleted(state, id) {
    state.bookmarks = state.bookmarks.filter(b => b.id !== id);
  }
};

const actions = {
  async fetchBookmarks({ commit }, probeId) {
    try {
      const { data } = await axios.get(`/probes/${probeId}/bookmarks`);
      commit("bookmarksFetched", data);
    } catch (error) {
      commit("showError", error);
    }
  },

  async createBookmark({ commit }, { probeId, ...bookmark }) {
    try {
      const { data } = await axios.post(
        `/probes/${probeId}/bookmarks`,
        bookmark
      );

      commit("bookmarkCreated", data);
    } catch (error) {
      commit("showError", error);
    }
  },

  async deleteBookmark({ commit }, id) {
    try {
      await axios.delete(`/bookmarks/${id}`);
      commit("bookmarkDeleted", id);
    } catch (error) {
      commit("showError", error);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
