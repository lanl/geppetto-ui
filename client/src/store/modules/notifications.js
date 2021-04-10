export default {
  state: {
    error: null
  },

  mutations: {
    showError(state, error) {
      state.error = extractError(error);
    },

    clearError(state) {
      state.error = null;
    }
  }
};

function extractError(error) {
  if (error.response && error.response.data) {
    return error.response.data;
  }

  return error;
}
