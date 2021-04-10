<template>
  <div>
    <!-- wait for local data to populate from request before loading child component -->
    <SupplementalContainer
      v-if="this.probe.analytic_info"
      :friendly="friendlyData"
      :probe="probeData"
      :analytic="analyticData"
    />
  </div>
</template>

<script>
import SupplementalContainer from "./components/SupplementalPage/SupplementalContainer.vue";
import * as axios from "axios";

export default {
  name: "Supplemental",
  data: function() {
    return {
      probe: {},
      analyticId: {},
      analyticFriendly: {}
    };
  },
  components: {
    SupplementalContainer
  },
  computed: {
    probeData: function() {
      return this.probe;
    },
    friendlyData: function() {
      return this.analyticFriendly;
    },
    analyticData: function() {
      const analyticList = this.probe.analytic_info;
      return analyticList.find(a => a.analytic_id == this.analyticId);
    }
  },
  methods: {
    getProbeInfo(hash, baseUrl) {
      const url = baseUrl.includes("localhost")
        ? `${baseUrl}/probes/${hash}`
        : `/probes/${hash}`;
      const probe = axios.get(url);

      probe
        .then(response => {
          this.probe = response.data;
        })
        .catch(err => {
          console.log("Error Retrieving Data", err);
        });
    },
    getAnalyticFriendly(baseUrl) {
      const url = baseUrl.includes("localhost")
        ? `${baseUrl}/analytics`
        : `/analytics`;
      const friendly = axios.get(url);

      friendly
        .then(response => {
          const mergedList = [
            ...response.data.imageAnalytics,
            ...response.data.videoAnalytics,
            ...response.data.fusers
          ];
          this.analyticFriendly = mergedList.find(a => a.id == this.analyticId);
        })
        .catch(err => {
          console.log("Error Retrieving Data", err);
        });
    }
  },
  /* Make request to server to get probe information and friendly analytic information
  .* keeping the 'state' of this component seperate from the global state
  */
  created() {
    const baseUrl =
      window.location.hostname == "localhost"
        ? "http://" + window.location.hostname + ":3000"
        : window.location.hostname;

    this.analyticId = this.$route.query.analytic;
    this.getProbeInfo(this.$route.query.probe, baseUrl);
    this.getAnalyticFriendly(baseUrl);
  }
};
</script>

<style scoped></style>
