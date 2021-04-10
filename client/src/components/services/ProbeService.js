import axios from "axios";
import store from "@/store";

const BASE_URL = store.getters.baseUri;

function probeInfo(filename, fused) {
  const fuser = store.getters.fusionModel;
  const includefused = fused ? 1 : 0;
  var url = `${BASE_URL}/probes/${filename}?includefused=${includefused}&fuser_id=${fuser}`;
  //var url = `${BASE_URL}/probes/${filename}`;
  return axios.get(url);
}

/* --- Tags --- */
const config = {
  headers: {
    "Content-Type": "application/json"
  }
};

function updateTags(id, tags) {
  const url = `${BASE_URL}/probes/` + id + "/tags/";
  if (tags.length !== "") return axios.put(url, { tags: tags }, config);
  return axios.patch(url, config);
}
function deleteTag(id, tag) {
  const url = `${BASE_URL}/probes/` + id + "/tags/";
  return axios.delete(url, { data: { tags: tag } });
}
function getAnalyticList() {
  const url = `${BASE_URL}/analytics`;
  return axios.get(url);
}
function getFacetInfo() {
  const url = `${BASE_URL}/facets`;
  return axios.get(url);
}

function deleteFailedAnalytics() {
  return axios
    .delete("/probes/failed-analytics", { baseURL: BASE_URL })
    .then(res => res.data);
}

async function getAllProbeIds() {
  let probeIds = [];
  let pageToken = "";

  for (;;) {
    const res = await axios.get("/probes", {
      baseURL: BASE_URL,
      params: {
        pagetoken: pageToken
      }
    });

    probeIds = probeIds.concat(res.data.detections.map(d => d.id));
    pageToken = res.data.page_token;

    if (!pageToken) {
      break;
    }
  }

  return probeIds;
}

function rerunProbeAnalytics(id) {
  return axios.post(`/probes/${id}/rerun`, {}, { baseURL: BASE_URL });
}

function updateMetadata(id, metadata) {
  return axios.patch(`/probes/${id}/metadata`, metadata, { baseURL: BASE_URL });
}

function getAnalyticStats() {
  return axios
    .get("/analytic-stats", {
      baseURL: BASE_URL
    })
    .then(res => res.data);
}

function getHistogram() {
  const { params } = store.getters;

  return axios
    .get("/histogram", {
      baseURL: BASE_URL,
      params
    })
    .then(res => res.data.buckets.reverse());
}

export {
  probeInfo,
  getAnalyticList,
  updateTags,
  deleteTag,
  getFacetInfo,
  deleteFailedAnalytics,
  getAllProbeIds,
  rerunProbeAnalytics,
  updateMetadata,
  getAnalyticStats,
  getHistogram
};
