import Vue from "vue";
import Buefy from "buefy";

import App from "./App.vue";
import router from "./router";
import store from "./store";

import "animate.css/animate.css";
import "./assets/main.scss";
import "./fontAwesome";

Vue.use(Buefy);

Vue.config.productionTip = false;

export default new Vue({
  el: "#app",
  router,
  store,
  render: h => h(App)
});
