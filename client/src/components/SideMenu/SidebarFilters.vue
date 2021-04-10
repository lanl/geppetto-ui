<template>
  <Container title="Filters">
    <div class="actions">
      <Button
        slot="actions"
        :isWarning="true"
        :isSmall="true"
        :isOutlined="true"
        @clicked="reset"
        >Reset</Button
      >
    </div>

    <form>
      <Prompt text="Score Probes by" />
      <ScoreSourceSelect class="is-fullwidth" />

      <Prompt text="Integrity Threshold" />
      <b-checkbox v-model="scoreFilterEnabledModel" type="is-primary"
        >Enabled</b-checkbox
      >
      <vue-slider
        class="score-filter-slider"
        :disabled="!scoreFilterEnabled"
        :lazy="true"
        v-model="scoreFilterModel"
      ></vue-slider>
      <div class="is-fullwidth has-text-right">
        {{ scoreFilter[1] | score }}&ndash;{{ scoreFilter[0] | score }}
      </div>

      <Prompt text="Media Type" />
      <ul @change="updateTags">
        <li>
          <b-radio
            v-model="selectedTags.system"
            :native-value="null"
            type="is-primary"
            >All</b-radio
          >
          <span class="count">{{ systemTotal }}</span>
        </li>
        <li v-for="tag in systemTags" :key="tag[0]">
          <b-radio
            v-model="selectedTags.system"
            :native-value="tag[0]"
            type="is-primary"
            >{{ capitalize(tag[0]) }}</b-radio
          >
          <span class="count">{{ tag[1] }}</span>
        </li>
      </ul>

      <Prompt text="Tags" />
      <ul @change="updateTags">
        <li v-for="tag in userTags" :key="tag[0]">
          <b-checkbox
            v-model="selectedTags.user"
            :native-value="tag[0]"
            type="is-primary"
            >{{ tag[0] }}</b-checkbox
          >
          <span class="count">{{ tag[1] }}</span>
        </li>
      </ul>

      <Prompt text="Exclude Tags" />
      <ul>
        <li v-for="tag in userTags" :key="tag[0]">
          <b-checkbox
            v-model="excludeTagsModel"
            :native-value="tag[0]"
            type="is-danger"
            >{{ tag[0] }}</b-checkbox
          >
          <span class="count">{{ tag[1] }}</span>
        </li>
      </ul>

      <Prompt text="Upload Date" />
      <div class="select is-fullwidth">
        <select
          :value="uploadDateFilter"
          @change="setUploadDateFilter($event.target.value)"
        >
          <option value="ANYTIME">Anytime</option>
          <option value="LAST_HOUR">Last hour</option>
          <option value="TODAY">Today</option>
          <option value="THIS_WEEK">This week</option>
          <option value="THIS_MONTH">This month</option>
          <option value="THIS_YEAR">This year</option>
        </select>
      </div>
    </form>
  </Container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import VueSlider from "vue-slider-component";

import ScoreSourceSelect from "@/components/common/ScoreSourceSelect.vue";
import score from "@/filters/score";
import Button from "./Button";
import Container from "./Container";
import Prompt from "./Prompt";

import "vue-slider-component/theme/default.css";

export default {
  name: "SidebarFilters",

  components: {
    Button,
    Container,
    Prompt,
    ScoreSourceSelect,
    VueSlider
  },

  filters: {
    score
  },

  data: function() {
    return {
      selectedTags: {
        system: null,
        user: []
      }
    };
  },

  methods: {
    ...mapActions([
      "fetchTagCounts",
      "resetFilters",
      "setScoreFilter",
      "setScoreFilterEnabled",
      "setTags",
      "setExcludeTags",
      "setUploadDateFilter"
    ]),

    capitalize: text => text.slice(0, 1).toUpperCase() + text.slice(1),
    dechrisifyKey: text => text.split("=")[0],
    dechrisifyValue: text => text.split("=")[1],
    rechrisifyKey: text => text + "=null",
    rechrisifyValue: text => "type=" + text.toLowerCase(),

    updateTags() {
      // Tags and Media Types
      const userTags = this.selectedTags.user.map(t => this.rechrisifyKey(t));
      const systemTags = this.selectedTags.system
        ? [this.rechrisifyValue(this.selectedTags.system)]
        : [];

      this.setTags([...userTags, ...systemTags]);
    },

    reset() {
      this.resetFilters();

      this.selectedTags = {
        system: null,
        user: []
      };
    }
  },

  computed: {
    ...mapState({
      scoreFilter: state => state.filters.scoreFilter,
      scoreFilterEnabled: state => state.filters.scoreFilterEnabled,
      excludeTags: state => state.filters.excludeTags,
      uploadDateFilter: state => state.filters.uploadDateFilter,
      systemTags(state) {
        if (!state.tags.tagCounts || !state.tags.tagCounts.tag_counts) {
          return [];
        }

        var counts = state.tags.tagCounts.tag_counts;
        return Object.keys(counts).map(value => [
          this.dechrisifyValue(value),
          counts[value]
        ]);
      },
      systemTotal: state => {
        if (!state.tags.tagCounts || !state.tags.tagCounts.tag_counts) {
          return 0;
        }

        const counts = Object.values(state.tags.tagCounts.tag_counts);
        return counts.reduce((previous, current) => {
          return previous + current;
        }, 0);
      },
      userTags(state) {
        if (!state.tags.tagCounts || !state.tags.tagCounts.user_tag_counts) {
          return [];
        }

        const user_tag_counts = state.tags.tagCounts.user_tag_counts;
        const countedTags = [];
        for (let [key, value] of Object.entries(user_tag_counts)) {
          countedTags.push([this.dechrisifyKey(key), value]);
        }
        countedTags.sort((a, b) => {
          if (a[0] < b[0]) return -1;
          if (a[0] > b[0]) return 1;
          return 0;
        });
        return countedTags;
      },
      tagCounts: state => state.tags.tagCounts,
      tagCountsAreValid: state => state.tags.tagCountsAreValid
    }),

    scoreFilterModel: {
      get() {
        return this.scoreFilter.map(score => (1 - score) * 100).reverse();
      },

      set(value) {
        this.setScoreFilter(value.map(score => 1 - score / 100).reverse());
      }
    },

    scoreFilterEnabledModel: {
      get() {
        return this.scoreFilterEnabled;
      },

      set(value) {
        this.setScoreFilterEnabled(value);
      }
    },

    excludeTagsModel: {
      get() {
        return this.excludeTags;
      },

      set(value) {
        this.setExcludeTags(value);
      }
    }
  },

  watch: {
    tagCountsAreValid: {
      handler() {
        if (!this.tagCountsAreValid) {
          this.fetchTagCounts();
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: row-reverse;
}

.score-filter-slider {
  margin: 5px;
}

ul {
  margin-bottom: 12px;
  padding-left: 12px;
}

.checkbox:hover,
.radio:hover {
  color: #eeeeee !important;
}

.count {
  color: hsl(0, 0%, 70%);
  float: right;
}
</style>
