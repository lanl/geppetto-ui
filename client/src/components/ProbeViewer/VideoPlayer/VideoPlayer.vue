<template>
  <!-- outer holder -->
  <div
    class="video-holder"
    ref="videoHolder"
    @keydown.arrow-left="seekBackward"
    @keydown.arrow-right="seekForward"
  >
    <!-- Video stage (container for transforms) -->
    <div
      id="video-container"
      ref="stage"
      class="stage"
      :class="{ 'stage-full': isFullScreen, 'stage-normal': !isFullScreen }"
    >
      <div class="actions">
        <button
          class="button is-small is-white is-outlined"
          @click="resetPanZoom"
        >
          Reset
        </button>
      </div>

      <!-- loading spinner -->
      <div class="video-spinner" v-if="showSpinner">
        <div class="video-spinner-inner">
          <font-awesome-icon icon="spinner" class="fa-spin" />
        </div>
      </div>

      <!-- actual video player -->
      <div ref="videoContainer">
        <video
          class="video-player"
          ref="videoPlayer"
          :muted="isMuted"
          :src="probeInfo.source"
          @error="$emit('error', $event.target.error)"
          @loadedmetadata="onLoadedMetadata"
          @durationchange="duration = $event.target.duration"
          @ratechange="playbackRate = $event.target.playbackRate"
          @timeupdate="timeUpdate"
          @volumechange="volume = $event.target.volume"
          @progress="calculateBufferRanges()"
          @waiting="unhideSpinner()"
          @canplay="hideSpinner()"
        >
          <p>Your Browser Doesn't support HTML5 Video</p>
        </video>

        <VideoAnnotationOverlay
          :time="time"
          :videoWidth="videoWidth"
          :videoHeight="videoHeight"
        />
      </div>
    </div>

    <!-- video controls -->
    <div
      class="video-controls has-background-white-ter"
      :class="{
        fixed: $store.getters.selectedAnalytic !== ''
      }"
    >
      <button class="button" @click="togglePlayPause">
        <span class="icon is-small">
          <font-awesome-icon :icon="videoPlaying ? 'pause' : 'play'" />
        </span>
      </button>

      <button class="button" @click="seekBackward">
        <span class="icon is-small">
          <font-awesome-icon icon="backward" />
        </span>
      </button>

      <button class="button" @click="seekForward">
        <span class="icon is-small">
          <font-awesome-icon icon="forward" />
        </span>
      </button>

      <div style="flex: auto">
        <!-- Scrubber Bar -->
        <div
          ref="progressbar"
          class="controls-progress"
          @click="skipToPosition($event)"
          @mousemove="showHoverTime($event)"
        >
          <div class="controls-progress-time" v-if="timeElapsed">
            {{ timeElapsed | duration(3) }}
          </div>
          <span
            class="controls-progress-back has-background-primary"
            :class="{ started: percentPlayed !== 0 }"
            :style="{ width: percentPlayed }"
          ></span>
          <div class="controls-progress-ranges">
            <span
              class="controls-progress-range"
              v-for="range in bufferRanges"
              :key="range.start"
              :style="{ width: range.end }"
            ></span>
          </div>
        </div>

        <!-- Manipulated Range Markers -->
        <div
          v-if="getRanges.length > 0"
          class="controls-progress-markers"
          @click="skipToPosition($event)"
        >
          <FrameTimeline :frameData="getRanges" />
        </div>
      </div>

      <!-- Time Remaining -->
      <div class="controls-time">{{ timeRemaining | duration }}</div>

      <VolumeControl
        :muted.sync="isMuted"
        :volume="volume"
        @update:volume="$refs.videoPlayer.volume = $event"
      />

      <PlaybackRateControl
        :playbackRate="playbackRate"
        @update:playbackRate="$refs.videoPlayer.playbackRate = $event"
      />

      <button class="button" @click="addBookmark">
        <span class="icon is-small">
          <font-awesome-icon icon="bookmark" />
        </span>
      </button>

      <button class="button" @click="captureFrame">
        <span class="icon is-small">
          <font-awesome-icon icon="camera" />
        </span>
      </button>

      <button class="button" @click="toggleFullscreen">
        <span class="icon is-small">
          <font-awesome-icon icon="expand" />
        </span>
      </button>
    </div>

    <div v-if="addingBookmark" class="modal is-active">
      <div class="modal-background" @click="cancelAddBookmark"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add Bookmark</p>
          <button class="delete" @click="cancelAddBookmark"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <div class="control">
              <textarea
                class="textarea"
                placeholder="Add a comment..."
                v-model="addingBookmark.comment"
              ></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="field">
            <div class="control">
              <button class="button is-primary" @click="saveAddBookmark">
                Save changes
              </button>
              <button class="button" @click="cancelAddBookmark">Cancel</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import { saveAs } from "file-saver";
import panzoom from "panzoom";

import duration from "@/filters/duration";
import FrameTimeline from "../../common/FrameTimeline";
import PlaybackRateControl from "./PlaybackRateControl.vue";
import VideoAnnotationOverlay from "./VideoAnnotationOverlay.vue";
import VolumeControl from "./VolumeControl.vue";

export default {
  name: "VideoPlayer",

  components: {
    FrameTimeline,
    PlaybackRateControl,
    VideoAnnotationOverlay,
    VolumeControl
  },

  filters: {
    duration
  },

  props: { probeInfo: Object },

  data: function() {
    return {
      addingBookmark: null,
      duration: 0,
      playbackRate: 1,
      time: 0,
      videoWidth: 0,
      videoHeight: 0,
      volume: 0,
      bufferRanges: [],
      isMounted: false,
      isMuted: false,
      panZoomHandler: null,
      percentPlayed: "0",
      ranges: [],
      showSpinner: false,
      timeElapsed: null,
      totalFrames: 0,
      videoPlaying: false,
      isFullScreen: false
    };
  },

  computed: {
    ...mapState({
      probe: state => state.pipeline.probe
    }),

    frameRate() {
      return (
        this.probe &&
        this.probe.meta &&
        this.probe.meta["QuickTime:VideoFrameRate"]
      );
    },

    fileNameStem() {
      const fileName =
        this.probe && this.probe.meta && this.probe.meta["File:FileName"];

      if (!fileName) {
        return "";
      }

      const index = fileName.lastIndexOf(".");

      if (index < 0) {
        return fileName;
      }

      return fileName.substring(0, index);
    },

    timeRemaining() {
      return this.duration - this.time;
    },

    getRanges: function() {
      var o = [];
      var analytic = {};
      for (const a of this.$store.getters.probe.analytic_info) {
        if (a.analytic_id === this.$store.getters.selectedAnalytic) {
          analytic = a;
          break;
        }
      }
      // break analytic into the localization ranges
      if (
        analytic.detection == undefined ||
        analytic.detection.vid_manip.localization === null
      )
        return {};
      for (const range of analytic.detection.vid_manip.localization
        .frame_detection) {
        //console.log("range", range.range.start, range.range.end, range.score);
        o.push(range);
      }

      return o;
    }
  },
  watch: {
    probeInfo: function(current, previous) {
      if (current.source !== previous.source) {
        this.resetPanZoom();
        return;
      }
    }
  },

  mounted() {
    this.isMounted = true;
    let self = this;
    self.$nextTick(function() {
      "";
      self.resetPanZoom();
    });

    //This adds an event listener for when fullscreen is toggled with ESC key or button
    self.$refs.videoHolder.addEventListener("fullscreenchange", () => {
      self.isFullScreen = !self.isFullScreen;
    });

    this.playbackRate = this.$refs.videoPlayer.playbackRate;
    this.volume = this.$refs.videoPlayer.volume;

    this.unsubscribe = this.$store.subscribeAction(action => {
      if (action.type === "seek") {
        this.$refs.videoPlayer.currentTime = action.payload;
      }
    });

    if (this.$route.query.time) {
      this.$refs.videoPlayer.currentTime = Number(this.$route.query.time);
    }
  },

  updated() {
    this.videoPlaying = !this.$refs.videoPlayer.paused;
  },

  beforeDestroy() {
    this.unsubscribe();
  },

  methods: {
    ...mapActions(["createBookmark"]),

    seekBackward() {
      if (!this.frameRate) {
        return;
      }

      this.$refs.videoPlayer.currentTime -= 1 / this.frameRate;
    },

    seekForward() {
      if (!this.frameRate) {
        return;
      }

      this.$refs.videoPlayer.currentTime += 1 / this.frameRate;
    },

    addBookmark() {
      this.addingBookmark = {
        probeId: this.probe.id,
        time: this.$refs.videoPlayer.currentTime,
        comment: ""
      };
    },

    saveAddBookmark() {
      this.createBookmark(this.addingBookmark).then(() => {
        this.addingBookmark = null;
      });
    },

    cancelAddBookmark() {
      this.addingBookmark = null;
    },

    captureFrame() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const fileNameStem = this.fileNameStem || this.probe.id;
      const time = duration(this.time, 3);

      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      ctx.drawImage(this.$refs.videoPlayer, 0, 0);

      canvas.toBlob(blob => {
        saveAs(blob, `${fileNameStem}-${time}.png`);
      });
    },

    toggleFullscreen() {
      if (!this.isFullScreen) {
        this.enterFullscreen();
      } else {
        this.exitFullscreen();
      }
    },

    resetPanZoom() {
      this.panZoomHandler = panzoom(this.$refs.videoContainer, {
        maxZoom: 4,
        minZoom: 1,
        smoothScroll: false
      });
      this.panZoomHandler.zoomAbs(0, 0, 1);
    },

    getFramesToPercent(frame) {
      // update frames
      if (this.$store.getters.meta == null) return "0%";

      this.totalFrames = this.$store.getters.meta["File:Frames"];
      return (frame / this.totalFrames) * 100 + "%";
    },
    computeMarkerStyle(start, end, score) {
      //alert(start + " " + end);
      return {
        left: this.getFramesToPercent(start),
        width: this.getFramesToPercent(end - start),
        top: (1 - score) * 20 + "px"
      };
    },

    percentageOffset(e) {
      return e.offsetX / this.$refs.progressbar.offsetWidth;
    },

    currentTime(percentage) {
      return (
        Math.floor(percentage * this.$refs.videoPlayer.duration * 100) / 100
      );
    },

    showHoverTime(e) {
      var percentageOffset = this.percentageOffset(e);
      var timeInSeconds = this.currentTime(percentageOffset);

      if (!isNaN(timeInSeconds)) {
        this.timeElapsed = timeInSeconds;
      }
    },

    calculateBufferRanges() {
      this.bufferRanges = [];

      if (!this.$refs.videoPlayer) {
        return;
      }

      // loop through ranges
      for (let i = 0, l = this.$refs.videoPlayer.buffered.length; i < l; i++) {
        const totalDuration = this.$refs.videoPlayer.duration;
        const startTime = Math.floor(
          (100 / totalDuration) * this.$refs.videoPlayer.buffered.start(i)
        );
        const endTime = Math.floor(
          (100 / totalDuration) * this.$refs.videoPlayer.buffered.end(i)
        );
        this.bufferRanges.push({ start: startTime + "%", end: endTime + "%" });
      }
    },

    togglePlayPause() {
      if (this.showSpinner) return false;
      this.videoPlaying ? this.pauseVideo() : this.playVideo();
    },

    pauseVideo() {
      this.$refs.videoPlayer.pause();
      this.videoPlaying = false;
    },

    playVideo() {
      this.$refs.videoPlayer.play();
      this.videoPlaying = true;
    },

    skipToPosition(e) {
      const percentageOffset = this.percentageOffset(e);
      this.$refs.videoPlayer.currentTime = this.currentTime(percentageOffset);
    },

    enterFullscreen() {
      if (this.$refs.videoHolder.requestFullscreen) {
        this.$refs.videoHolder.requestFullscreen();
      } else if (this.$refs.videoHolder.webkitRequestFullScreen) {
        this.$refs.videoHolder.webkitRequestFullScreen();
      } else if (this.$refs.videoHolder.mozRequestFullScreen) {
        this.$refs.videoHolder.mozRequestFullScreen();
      } else if (this.$refs.videoHolder.msRequestFullscreen) {
        this.$refs.videoHolder.msRequestFullscreen();
      }
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    },

    percentagePlayed() {
      //trick vue into waiting for mounted
      if (!this.isMounted) return "0%";
      if (
        this.$refs.videoPlayer == undefined ||
        this.$refs.videoPlayer.readyState < 2
      )
        return "0%";
      return (
        Math.floor(
          (100 / this.$refs.videoPlayer.duration) *
            this.$refs.videoPlayer.currentTime
        ) + "%"
      );
    },

    onLoadedMetadata(e) {
      this.videoWidth = e.target.videoWidth;
      this.videoHeight = e.target.videoHeight;
    },

    timeUpdate(e) {
      this.time = e.target.currentTime;
      this.percentPlayed = this.percentagePlayed();
    },

    unhideSpinner() {
      this.showSpinner = true;
    },

    hideSpinner() {
      this.showSpinner = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.stage,
.video-controls {
  max-width: 100vw;
  margin: 0 auto;
}

.stage {
  margin-top: 12px;
  position: relative;
  overflow: hidden;
  background: #606c88;
  background: radial-gradient(
    ellipse at center,
    hsl(0, 0%, 25%) 0%,
    hsl(0, 0%, 5%) 100%
  );
  border: solid 1px #606c88;
}

.stage-full {
  height: 94%;
  max-height: 95vh;
}

.video-controls {
  border: solid 1px silver;
  border-top: none;
  padding: 3px;
  display: flex;
  align-items: center;
  width: 100%;
}

.video-controls > * {
  margin: 4px;
}

video {
  display: block;
  width: 100%;
}

.video-holder:not(:fullscreen) video {
  max-height: calc(100vh - 12rem);
}

.video-holder:fullscreen video {
  max-height: calc(100vh - 48px);
}

#video-container {
  position: relative;
}

.actions {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1000;
}

.video-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
}
.video-spinner-inner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  font-size: 50px;
}

.controls-button {
  flex: 0 0 60px;
  display: block;
  position: relative;
  height: 40px;
  margin-right: 14px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  border: 1px solid #777;
}

.controls-button:focus {
  outline: none;
}

.controls-button:before,
.controls-button:after {
  content: "";
  position: absolute;
}

.controls-button.play:before {
  left: 50%;
  top: 50%;
  margin: -10px 0 0 -6px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 18px solid white;
}

.controls-button.pause:before,
.controls-button.pause:after {
  height: 22px;
  width: 6px;
  background-color: white;
  top: 9px;
}

.controls-button.pause:before {
  left: 20px;
}

.controls-button.pause:after {
  left: 34px;
}
.controls-bar {
  display: flex;
  flex-grow: 1;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  height: 34px;
}
.controls-progress {
  flex: 1;
  margin: 0;
  width: 100%;
  height: 6px;

  border-radius: 3px;

  background-color: black;
  position: relative;
}

.controls-progress:hover {
  cursor: pointer;
}
.controls-progress:hover .controls-progress-time {
  display: block;
}
.controls-progress-time {
  display: none;
  position: absolute;
  top: -40px;
  left: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 12px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.controls-progress-back {
  position: absolute;
  height: 6px;
  top: 0;
  left: 0;
  width: 0;
  border-radius: 3px;
  z-index: 9999;
}
.controls-progress-ranges {
  position: absolute;
  height: 6px;
  top: 0;
  left: 0;
  right: 0;
  background-color: #000;
  border: 1px solid #333;
  border-radius: 3px;
  overflow: hidden;
  z-index: 999;
}
.controls-progress-range {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 0;
  border-radius: 3px;
  background-color: grey;
  z-index: 500;
}

.controls-progress-markers {
  cursor: pointer;
  margin-top: 6px;
  height: 20px;
}

.controls-time {
  font-variant-numeric: tabular-nums;
}

.controls-fullscreen {
  width: 20px;
  height: 16px;
  position: relative;
  transition: transform 0.2s ease;
  margin-right: 12px;
}
.controls-fullscreen:hover {
  transform: scale(1.05);
  cursor: pointer;
}
.controls-fullscreen span {
  position: absolute;
  width: 5px;
  height: 5px;
  display: block;
}
.controls-fullscreen span:first-child {
  top: 0;
  left: 0;
  border-left: 2px solid white;
  border-top: 2px solid white;
}
.controls-fullscreen span:nth-child(2) {
  top: 0;
  right: 0;
  border-top: 2px solid white;
  border-right: 2px solid white;
}
.controls-fullscreen span:nth-child(3) {
  bottom: 0;
  left: 0;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
}
.controls-fullscreen span:last-child {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid white;
  border-right: 2px solid white;
}

// --------------
/* Slider */
$track-color: darkgray;
$track-height: 8px;
</style>
