<template>
  <div id="probe-view-container">
    <!-- video player -->
    <div v-if="!parsedProbe.isImage">
      <VideoPlayer :probeInfo="parsedProbe" @error="showError($event)" />
    </div>

    <div v-else class="full-container" :style="transformCalc">
      <div
        class="media-container"
        @mousedown.prevent="startDrag($event)"
        @mouseup="stopDrag($event)"
        @mousemove.prevent="drag($event)"
        @dblclick="resetDrag()"
        ref="mediaContainer"
      >
        <!--  image -->
        <div :style="rotateStyle">
          <!-- overlay img -->
          <img
            crossorigin=""
            id="overlay"
            :class="imgClass"
            v-if="maskUrl !== ''"
            :src="maskUrl"
            alt="Mask Image"
            :style="maskImgStyle"
          />

          <!-- original img -->
          <img :src="probeUrl" alt="Probe Image" :class="imgClass" />
        </div>

        <!-- hidden image and canvas used for preloading and coloring -->
        <img id="hiddenImg" crossorigin="" class="hidden" />
        <canvas id="canvas" class="hidden"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from "vuex";
import { probeParserMixin } from "../../mixins/probeParserMixin";

/*eslint no-unused-vars: ["error", { "args": "none" }]*/
import VideoPlayer from "./VideoPlayer/VideoPlayer";
import * as cGradients from "../../helpers/colorGradients";

export default {
  name: "ProbeView",
  components: { VideoPlayer },
  mixins: [probeParserMixin],

  props: {
    rotateState: Number,
    zoomState: Number,
    blendMode: String,
    viewMode: String
  },

  data: function() {
    return {
      base_uri: this.$store.getters.baseUri,
      hideImg: false,
      offsetX: 0,
      offsetY: 0,
      mouseX: 0,
      mouseY: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      isDragging: false
    };
  },

  computed: {
    ...mapState({
      probe: state => state.pipeline.probe
    }),

    ...mapGetters(["maskUrl"]),

    probeUrl: function() {
      var url = this.$store.getters.baseUri + "/input/";
      var filename = this.$store.getters.probe.analytic_info[0].detection
        .img_manip_req.image.uri;
      var start = filename.indexOf("input/") + 6;
      filename = filename.substring(start);
      url += encodeURIComponent(filename);
      return url;
    },

    styleBlendMode: function() {
      return {
        "mix-blend-mode": this.blendMode
      };
    },

    transformCalc: function() {
      const transform = {
        "transform-origin": "(50%, 50%);"
      };

      transform.transform = this.$store.getters.imageSelected
        ? `scale(${this.zoomState / 100})`
        : "scale(1)";

      return transform;
    },

    rotateStyle: function() {
      return {
        position: "relative",
        top: "50%",
        transform: `rotate(${90 * this.rotateState}deg)`
      };
    },

    maskImgStyle: function() {
      let style = {
        visibility: this.hideImg ? "hidden" : "visible"
      };
      if (this.viewMode === "overlay") {
        style["mix-blend-mode"] = this.blendMode;
        style["opacity"] = this.$store.getters.maskOpacity;
      }
      return style;
    },
    imgClass: function() {
      return this.$store.getters.maskUrl !== "" ? this.viewMode : "overlay";
    }
  },

  mounted() {
    /*eslint no-unused-vars: ["error", { "args": "none" }]*/
    // subscribe to colormap changes
    this.$store.subscribe((mutation, state) => {
      switch (mutation.type) {
        case "selectColormap":
          this.hideImg = true;
          this.changeColormap();

          break;
        case "selectMask":
          this.hideImg = true;
          this.changeColormap();
      }
    });
  },

  methods: {
    ...mapMutations(["showError"]),

    changeColormap() {
      if (this.$store.getters.maskUrl === "") {
        return;
      }

      // get references
      var colormap = this.$store.getters.colormap;
      // move img src to canvas for coloring
      const cvs = document.getElementById("canvas");
      // final result goes here when complete
      var overlay = document.getElementById("overlay");
      // load new mask here. onload allows it to load fully before coloring
      const img = document.getElementById("hiddenImg");
      var vm = this;

      // wait for img.src to load
      img.onload = function() {
        if (
          vm.$store.getters.colormap === cGradients.greyscale ||
          vm.$store.getters.selectedAnalytic == "groundtruth"
        ) {
          while (overlay == null) {
            overlay = document.getElementById("overlay");
          }
          overlay.src = vm.$store.getters.maskUrl;
          vm.hideImg = false;
          return;
        }

        // setup canvas context
        cvs.width = img.width;
        cvs.height = img.height;
        var ctx = cvs.getContext("2d");
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        var idt = ctx.getImageData(0, 0, cvs.width, cvs.height);

        // manipulate data
        var d = idt.data;
        for (var i = 0; i < d.length; i += 4) {
          // just need one of r,g,b since they are already greyscale
          let r = d[i];
          let lum = r / 255;

          // color r g b a based on linear interp of color gradient
          let col = cGradients.interpolateGradient(colormap, lum);
          d[i] = col[0];
          d[i + 1] = col[1];
          d[i + 2] = col[2];
          d[i + 3] = 255;
        }
        // save canvas data to overlay
        ctx.putImageData(idt, 0, 0);

        // sometimes this misbehaves and needs to be fetched
        while (overlay == null) {
          overlay = document.getElementById("overlay");
        }

        overlay.src = cvs.toDataURL();
        vm.hideImg = false;
      };

      // setup a new image
      img.src = this.$store.getters.maskUrl;
    },
    resetDrag() {
      this.mouseX = this.mouseY = this.lastMouseX = this.lastMouseY = 0;
      this.$refs.mediaContainer.style.left = "0px";
      this.$refs.mediaContainer.style.top = "0px";
    },
    startDrag(e) {
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.isDragging = true;
    },
    stopDrag(e) {
      this.isDragging = false;
    },
    drag(e) {
      if (!this.isDragging) return;

      this.mouseX = this.lastMouseX - e.clientX;
      this.mouseY = this.lastMouseY - e.clientY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      this.$refs.mediaContainer.style.left =
        this.$refs.mediaContainer.offsetLeft - this.mouseX + "px";
      this.$refs.mediaContainer.style.top =
        this.$refs.mediaContainer.offsetTop - this.mouseY + "px";
    }
  }
};
</script>

<style scoped lang="scss">
#probe-view-container {
  height: 100%;
  width: 100%;
  background: #fff;
  overflow: hidden;
  padding-left: 2%;
  padding-right: 2%;
}

.full-container {
  position: relative;
  height: 100%;
  width: 100%;
}
.media-container {
  position: relative;
  height: 100%;
  width: 100%;
}
.media-container div img:first-child {
  z-index: 999;
}
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vertical {
  display: block;
  max-height: 50%;
}
.horizontal {
  display: inline-block;
  max-width: 50%;
}
.hidden {
  display: none;
  visibility: hidden;
}
</style>
