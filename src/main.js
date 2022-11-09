import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import {
  Menu, MenuItem, Carousel, CarouselItem, Container, Aside, Main, Footer, Button, Input, ColorPicker, Slider, Upload, Select, Option
} from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(Container);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Button);
Vue.use(Input);
Vue.use(ColorPicker);
Vue.use(Slider);
Vue.use(Upload);
Vue.use(Select);
Vue.use(Option);

import router from "@/router";

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
