import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import { Menu, MenuItem, Carousel, CarouselItem, Container, Aside, Main, Footer } from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(Container);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);


import router from "@/router";

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
