import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import { Menu, MenuItem } from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Menu);
Vue.use(MenuItem);

import router from "@/router";

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
