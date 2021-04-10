<template>
  <div class="vcontainer">
    <div class="tab-container">
      <Detector
        v-for="a in sortedDetectors"
        :key="a.analytic_id"
        :data="a"
        :friendlyData="getFriendlyData(a)"
        :detectionType="detectionHandler(a)"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Detector from "./AnalyticCard/Detector";

export default {
  name: "Detectors",
  components: {
    Detector
  },
  computed: {
    ...mapState({
      probe: state => state.pipeline.probe,
      fusionModel: state => state.pipeline.fusionModel,
      analyticSortDir: state => state.layout.analyticSortDir,
      analyticSortField: state => state.layout.analyticSortField
    }),

    hasFused: function() {
      return this.probe.has_fused;
    },

    info: function() {
      return this.probe.analytic_info;
    },

    currentFusionModel: function() {
      return this.fusionModel !== "";
    },
    selectedFuser: function() {
      return this.currentFusionModel
        ? this.probe.fusion_info.find(
            fuser => fuser.fuser_id == this.fusionModel
          )
        : false;
    },
    sortedDetectors: function() {
      if (this.probe.analytic_info === undefined) {
        //alert("no analytics");
        return [];
      }
      let sortList = this.probe.analytic_info.slice();
      let gtAnalytic = sortList.find(a => a.analytic_id == "groundtruth");
      sortList = sortList.filter(a => {
        return a.analytic_id !== "groundtruth";
      });
      //If length is 1 after removing GT reappend and return
      if (sortList.length == 1) {
        return gtAnalytic !== undefined
          ? sortList.unshift(gtAnalytic)
          : sortList;
      }

      let sortName = this.analyticSortField;
      let sortDir = this.analyticSortDir;

      function getUniversalScore(analytic) {
        if (analytic.detection.img_manip !== undefined)
          return analytic.detection.img_manip.score;
        else return analytic.detection.vid_manip.score;
      }

      sortList = sortList.sort((a, b) => {
        let analyticA = this.$store.getters.getFriendly(a.analytic_id);
        let analyticB = this.$store.getters.getFriendly(b.analytic_id);

        var aVal =
          sortName == "name"
            ? analyticA.name
            : sortName == "score"
            ? getUniversalScore(a)
            : Number(this.hasMask(a));
        var bVal =
          sortName == "name"
            ? analyticB.name
            : sortName == "score"
            ? getUniversalScore(b)
            : Number(this.hasMask(b));

        if (aVal < bVal || aVal === undefined) return -1 * sortDir;
        if (aVal > bVal || bVal === undefined) return 1 * sortDir;
        return 0;
      });

      if (sortName == "name") {
        if (gtAnalytic !== undefined) sortList.unshift(gtAnalytic);
        //if there is a current fusionModel selected, append it to the front
        if (this.selectedFuser) sortList.unshift(this.selectedFuser);
        return sortList;
      } else if (sortName == "mask") {
        if (gtAnalytic !== undefined) sortList.unshift(gtAnalytic);
        //if there is a current fusionModel selected, append it to the front
        if (this.selectedFuser) sortList.unshift(this.selectedFuser);
        return sortList;
      } else {
        let noScore = sortList.filter(a => {
          if (a.detection.img_manip !== undefined)
            return (
              a.detection.img_manip.opt_out == 1 ||
              a.detection.img_manip.opt_out == 2
            );
          else return a.detection.vid_manip.opt_out.includes(0);
        });
        let hasScore = sortList.filter(a => {
          if (a.detection.img_manip !== undefined)
            return (
              a.detection.img_manip.opt_out !== 1 &&
              a.detection.img_manip.opt_out !== 2
            );
          else return !a.detection.vid_manip.opt_out.includes(0);
        });
        if (sortName == "score") {
          if (gtAnalytic !== undefined) hasScore.unshift(gtAnalytic);
          //if there is a current fusionModel selected, append it to the front
          if (this.selectedFuser) hasScore.unshift(this.selectedFuser);
        }
        let finalSort = hasScore.concat(noScore);
        return finalSort;
      }
    },
    supplementalList: function() {
      var detectors = this.sortedDetectors;
      var hasSupplemental = [];
      var supplementalList = [];
      //iteratore over detectors and filter one with supplemental data
      detectors.forEach(element => {
        const type = element.detection || element.fusion;
        const target = type.img_manip || type.vid_manip;
        if (target.supplement.length !== 0) hasSupplemental.push(element);
      });
      //build array containg the analytics and all supplemental data for each
      hasSupplemental.forEach(element => {
        var detector = {};
        const name = this.getFriendlyData(element).name;
        const type = element.detection || element.fusion;
        const target = type.img_manip || type.vid_manip;
        const supplementalData = target.supplement;
        detector.name = name;
        detector.supplemental = [];
        supplementalData.forEach(item => {
          detector.supplemental.push(item);
        });
        supplementalList.push(detector);
      });
      return supplementalList;
    }
  },
  methods: {
    detectionHandler(detection) {
      return detection.detection ? "analytic" : "fuser";
    },
    hasMask(analytic) {
      return analytic.detection.img_manip !== undefined
        ? analytic.detection.img_manip.localization !== null
        : analytic.detection.vid_manip.localization !== null;
    },
    sendMask(analytic) {
      if (this.hasMask(analytic)) {
        var url = analytic.detection.img_manip.localization.mask.uri.substring(
          16
        );
        this.$store.commit("selectMask", url);
      } else {
        this.$store.commit("selectMask", "");
      }
    },
    getFriendlyData(detection) {
      const id = detection.detection
        ? detection.analytic_id
        : detection.fuser_id;
      return this.$store.getters.getFriendly(id);
    },
    startInterval() {
      this.intervalId = setInterval(() => {
        if (
          this.probe.analytics_finished == this.probe.analytics_total &&
          this.probe.analytics_total != 0
        )
          return;
        var payload = {};
        payload.probe = this.probe;
        payload.include_fused =
          this.probe.analytic_info[0].detection.img_manip !== null;
        this.$store.dispatch("selectProbe", payload);
      }, 10000);
    }
  },

  mounted() {
    this.startInterval();
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>

<style scoped>
.vcontainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}

.tab-container {
  padding: 4px;
  flex: 1;
  overflow: auto;
}
</style>
