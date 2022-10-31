import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import { Menu, MenuItem, Carousel, CarouselItem } from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Carousel);
Vue.use(CarouselItem);

import router from "@/router";

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
