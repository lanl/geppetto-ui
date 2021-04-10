import moment from "moment";

let timeoutId = null;

const state = {
  scoreFilter: [0, 1],
  scoreFilterEnabled: false,
  uploadDateFilter: "ANYTIME",
  tags: [],
  excludeTags: [],
  metaQuery: "",
  scoreSource: "",
  sortField: "File:UploadDate",
  sortDir: -1
};

const getters = {
  params(state, getters) {
    const { isAnalyticId, isFuserId } = getters;

    return {
      ...applyScoreFilter(state.scoreFilter, state.scoreFilterEnabled),
      ...applyUploadDateFilter(state.uploadDateFilter),
      tags: state.tags.join(",") || null,
      exclude_tags: state.excludeTags.join(",") || null,
      meta_query: state.metaQuery !== "" ? state.metaQuery : null,
      analytic_id: isAnalyticId(state.scoreSource) ? state.scoreSource : null,
      fuser_id: isFuserId(state.scoreSource) ? state.scoreSource : null,
      column: state.sortField,
      dir: state.sortDir
    };
  }
};

const mutations = {
  setScoreFilter(state, scoreFilter) {
    state.scoreFilter = scoreFilter;
  },

  setScoreFilterEnabled(state, scoreFilterEnabled) {
    state.scoreFilterEnabled = scoreFilterEnabled;
  },

  setUploadDateFilter(state, uploadDateFilter) {
    state.uploadDateFilter = uploadDateFilter;
  },

  setTags(state, tags) {
    state.tags = tags;
  },

  setExcludeTags(state, excludeTags) {
    state.excludeTags = excludeTags;
  },

  setMetaQuery(state, metaQuery) {
    state.metaQuery = metaQuery;
  },

  setScoreSource(state, scoreSource) {
    state.scoreSource = scoreSource;
  },

  setSortField(state, sortField) {
    state.sortField = sortField;
  },

  setSortDir(state, sortDir) {
    state.sortDir = sortDir === "asc" ? 1 : -1;
  }
};

const actions = {
  resetFilters({ rootState, commit }) {
    const { fusers } = rootState.pipeline.analyticList;

    commit("setScoreFilter", [0, 1]);
    commit("setScoreFilterEnabled", false);
    commit("setUploadDateFilter", "ANYTIME");
    commit("setTags", []);
    commit("setExcludeTags", []);
    commit("setMetaQuery", "");
    commit("setScoreSource", fusers.length > 0 ? fusers[0].id : "");
  },

  setScoreFilter({ commit }, scoreFilter) {
    commit("setScoreFilter", scoreFilter);
    commit("invalidateProbes");
  },

  setScoreFilterEnabled({ commit }, scoreFilterEnabled) {
    commit("setScoreFilterEnabled", scoreFilterEnabled);
    commit("invalidateProbes");
  },

  setUploadDateFilter({ commit }, uploadDateFilter) {
    commit("setUploadDateFilter", uploadDateFilter);
    commit("invalidateProbes");
  },

  setTags({ commit }, tags) {
    commit("setTags", tags);
    commit("invalidateProbes");
  },

  setExcludeTags({ commit }, excludeTags) {
    commit("setExcludeTags", excludeTags);
    commit("invalidateProbes");
  },

  setMetaQuery({ commit }, metaQuery) {
    commit("setMetaQuery", metaQuery);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = setTimeout(() => commit("invalidateProbes"), 250);
  },

  clearMetaQuery({ commit }) {
    commit("setMetaQuery", "");

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    commit("invalidateProbes");
  },

  setScoreSource({ commit }, scoreSource) {
    commit("setScoreSource", scoreSource);
    commit("invalidateProbes");
  },

  setSortField({ commit }, sortField) {
    commit("setSortField", sortField);
    commit("invalidateProbes");
  },

  setSortDir({ commit }, sortDir) {
    commit("setSortDir", sortDir);
    commit("invalidateProbes");
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};

function applyScoreFilter(scoreFilter, scoreFilterEnabled) {
  if (scoreFilterEnabled) {
    return {
      score_min: scoreFilter[0],
      score_max: scoreFilter[1]
    };
  }

  return {};
}

function applyUploadDateFilter(uploadDateFilter) {
  switch (uploadDateFilter) {
    case "LAST_HOUR":
      return {
        upload_date_min: moment()
          .subtract(1, "hours")
          .toISOString()
      };

    case "TODAY":
      return {
        upload_date_min: moment()
          .startOf("day")
          .toISOString()
      };

    case "LAST_WEEK":
      return {
        upload_date_min: moment()
          .startOf("week")
          .toISOString()
      };

    case "LAST_MONTH":
      return {
        upload_date_min: moment()
          .startOf("month")
          .toISOString()
      };

    case "LAST_YEAR":
      return {
        upload_date_min: moment()
          .startOf("year")
          .toISOString()
      };

    default:
      return {};
  }
}
