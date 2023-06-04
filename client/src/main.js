import Vue from "vue";
import App from "./App.vue";
import VueRouter from "vue-router";
import "./styles/variables.css";
import "./styles/main.css";

Vue.use(VueRouter);

import Home from "./views/Home.vue";
import Scene from "./views/Scene.vue";
import Enums from "./views/Enum.vue";
import Controllers from "./views/Controllers.vue";

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/^ion-/];

const router = new VueRouter({
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/scene/:id",
      component: Scene,
    },
    {
      path: "/enums/",
      component: Enums,
    },
    {
      path: "/controllers/",
      component: Controllers,
    },
  ],
});

const app = new Vue({
  render: (h) => h(App),
  router,
});

app.$mount("#app");
