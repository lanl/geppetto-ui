import axios from "axios";

let cancelTokenSource;

const state = {
  probes: [],
  tags: [],
  isUploading: false,
  progress: 0,
  total: 0
};

const mutations = {
  addUploadProbes(state, files) {
    if (state.isUploading) {
      return;
    }

    for (const file of files) {
      state.probes.push({
        file,
        isFinished: false,
        error: null
      });
    }
  },

  removeUploadProbe(state, index) {
    if (state.isUploading) {
      return;
    }

    state.probes.splice(index, 1);
  },

  setUploadTags(state, tags) {
    state.tags = tags;
  },

  uploadStarted(state) {
    state.isUploading = true;
    state.progress = 0;
    state.total = state.probes.length;

    for (const probe of state.probes) {
      probe.isFinished = false;
      probe.error = null;
    }
  },

  uploadProbeStarted(state, index) {
    state.progress = index;
  },

  uploadProbeSucceeded(state) {
    state.probes[state.progress].isFinished = true;
    state.probes[state.progress].error = null;
  },

  uploadProbeFailed(state, error) {
    state.probes[state.progress].isFinished = true;
    state.probes[state.progress].error = error;
  },

  uploadFinished(state) {
    state.isUploading = false;
    state.probes = state.probes.filter(
      probe => !probe.isFinished || probe.error
    );
  }
};

const actions = {
  async uploadProbes({ state, commit }) {
    if (state.isUploading) {
      return;
    }

    cancelTokenSource = axios.CancelToken.source();
    const tags = state.tags.join(",");
    commit("uploadStarted");

    for (const [index, probe] of state.probes.entries()) {
      commit("uploadProbeStarted", index);

      const formData = new FormData();
      formData.append("probe", probe.file);
      formData.append("tags", tags);

      try {
        await axios.post("/upload", formData, {
          cancelToken: cancelTokenSource.token
        });

        commit("uploadProbeSucceeded");
      } catch (error) {
        commit("uploadProbeFailed", error);

        if (axios.isCancel(error)) {
          break;
        }
      }
    }

    commit("uploadFinished");
    commit("invalidateProbes");
    commit("invalidateTagCounts");
  },

  cancelUploadProbes() {
    if (!cancelTokenSource) {
      return;
    }

    cancelTokenSource.cancel("Canceled");
  }
};

export default {
  state,
  mutations,
  actions
};
