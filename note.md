# 1.完成NavHeader组件以及路由配置

封装NavHeader组件时使用了element-ui，element-ui官方文档的代码里使用了组件<el-menu>和<el-menu-item>，对应标签，按需引入时引入的相关插件名字是`Menu MenuItem`。

main.js：

~~~js
//引入与标签对应的插件
import { Menu, MenuItem } from "element-ui";

//引入elemnt-ui的样式
import 'element-ui/lib/theme-chalk/index.css';

//使用插件—让对应组件生效
Vue.use(Menu);
Vue.use(MenuItem);
~~~

# 2.Wallpaper组件

文本用<p>标签呈现，利用props接收字体样式以及内容的配置对象

# 3.引入自定义字体

字体文件存放在`@/assets/font`文件夹下，在App.vue组件的<style>中用`@font-face`自定义字体：

~~~css
@font-face {
  /*
  	font-family:指定自定义字体的字体名
    src:url指定自定义字体文件的路径;format与字体文件后缀对应（ttf对应truetype）
  */
  font-family: "庞门正道粗书体";
  font-weight: 400;
  src: 
    url(~@/assets/font/庞门正道粗书体.ttf) format("truetype");
}
~~~

免费字体文件下载网站：[免费字体 - 字体大全 - 字体安装包免费下载 - 图星人 (txrpic.com)](https://www.txrpic.com/ziti/?utm_source=360&utm_term=527)

# 4.Scale组件

模板内容：`<div class="container"><slot></slot></div>`，相当于一个组件外框，插槽<slot>替换为其它组件

# 5.Screen组件

类似于Scale组件的作用，做一个组件外框

# 6.Home页面基本结构

~~~html
<scale
  v-for="example in examples"
  :key="example.type"
  :data="example.scale"
>
  <screen :type="examples.type">
    <wallpaper :data="example.data" />
  </screen>
</scale>
~~~

# 7.Scale组件处理props接收的数据

props接受的数据width、height、x、y都是用数组表示的范围，我们在Scale组件中定义计算属性current，希望结合props接收的另外两个属性（progress、domain）得到一个对象，属性width、height、x、y值为具体值。

虽然暂时不明白计算的准确意义，但是current计算属性的实现还是有所收获的——**将一个对象加工处理成另一个（同属性名、不同值）对象**。

~~~js
current: function () {
  /*
  	this.data.range是一个对象，Object.keys获取其属性名的数组
  	利用数组的reduce方法重新构造一个对象：
  		一般reduce方法用来求和，我们把reduce的初始值也就是第二个参数设为{}，遍历方法
  		也就是第一个参数的函数体，每次为空对象添加一个属性
  */
  return Object.keys(this.data.range).reduce((obj, key) => {
    const [r0, r1] = this.data.range[key];//数组的解构赋值（对应位置进行赋值），得到
    /*
    	对属性key进行加工，得到key的值
    */
    obj[key] = ...;
    return obj;
  }, {});
},
~~~

# 8.Wallpaper可缩放实现

首先进行代码更新部分的解析：

## 新增方法：

### `@/utils/math.js-function map`：

~~~js
export function map(v, d0, d1, r0, r1) {
  const t = (v - d0) / (d1 - d0);
  return r0 * (1 - t) + r1 * t;
}
~~~

记返回值为`x`，由`r0 * (1 - t) + r1 * t = x`可得：

`(v - d0)/(d1 - d0) = (x - r0)/(r1 - r0)`

即d0和d1是一个范围，r0和r1是另一个范围，v属于[d0, d1]，**返回值x在[r0, r1]范围内的位置与v在[d0, d1]的位置相同**。

### `@/utils/math.js-function constrain`：（约束函数）

~~~js
export function constrain(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
~~~

**返回三个数中大小中间的那一个数**（三个数，其中任意两个取大，再和另一个数取小，得到中间数）

## 新增混入：

### `@/mixins/useWindowScroll.js`：

~~~js
import { constrain } from "../utils/math";

export const useWindowScroll = (
  minY = 0,
  maxY = 200,
  minX = 0,
  maxX = 200
) => ({
  data: () => ({
    scrollY: 0,
    scrollX: 0,
  }),
  mounted: function() {
    window.addEventListener("mousewheel", ({ deltaY, deltaX }) => {
      this.scrollY = constrain(this.scrollY + deltaY, minY, maxY);
      this.scrollX = constrain(this.scrollX + deltaX, minX, maxX);
    });
  },
});
~~~

**给使用这个混入的组件增加并维护(通过监听window的鼠标滚动事件mousewheel)两个变量`scrollY`和`scrollX`记录鼠标滚动的程度**(PC端鼠标滚动只影响scrollY，scrollX意义不大)，且利用constrain函数，scrollY会被约束在minY和maxY之间。

### `@/mixins/useWindowSize.js`：

~~~js
export const useWindowSize = () => ({
  data: () => ({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  }),
  mounted: function() {
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    });
  },
});
~~~

**给组件维护两个变量`windowWidth`和`windowHeight`实时记录浏览器窗口宽高**

plus：两个混入都是利用window对象，通过对window对象进行事件监听以及访问window对象的属性实现的。

## Scale组件结构与逻辑修改：

Scale组件通过props接收from、to、progress对象，from和to记录Scale的初始和结束状态（大小与位置），progress记录当前变化的进度，三个对象便可确定当前Scale组件的大小与位置。我们只需在使用Scale组件时固定from和to，动态传递progress对象，便可实现动态效果。

动态效果的基本实现逻辑就是给Scale的根元素动态添加style，修改定位属性`top`和`left`修改位置，修改`transform:scale()`的值修改大小。

plus：这里说一下`transform：scale`，通过scale并不是真正改变元素的像素大小，而是视觉效果上等价于改变像素大小（如果scale真正改变了元素的宽高像素值，那scale和width两者就构成无限循环增大的套娃了，这怎么可能）。所以我们Scale的宽高自始至终都不变，改变的只是transform-scale。然后再说一下`transformOrigin: '0 0'`这个属性，`transform`变化有一个中心点，默认在transform元素的中心位置，即`transformOrigin: '50% 50%'`，其实transformOrigin可以理解为transform变化的不动点：transform变化前后的图像重合的位置。之所以设置`transformOrigin: '0 0'`是因为我们缩放时位置改变是根据top和left，即元素左上角为中心进行定位，如果我们transform的不动点不在左上角就会出现视觉上top和left的偏移。

Scale组件内部维护计算属性`current`：

~~~js
computed: {
  current: function () {
    /*
    	解构赋值起别名
    */
    const { x: fromX, y: fromY, width: fromW, height: fromH } = this.from;
    const { x: toX, y: toY, width: toW, height: toH } = this.to;
    return {
      x: map(this.progress, 0, 1, fromX, toX),
      y: map(this.progress, 0, 1, fromY, toY),
      /*
      	记Home组件中的scale（toW / fromW、toH / fromH）为S
      	progress∈[0, 1],对应的scale的值∈[1, S]
      */
      scale: map(this.progress, 0, 1, 1, (toW / fromW + toH / fromH) / 2),
      width: fromW,
      height: fromH,
    };
  },
},
~~~

## Home组件结构与逻辑：

使用上面定义的两个混入，useWindowScroll混入维护的滚动程度变量scrollY的作用是动态关联`progress`；useWindowSize混入维护的浏览器大小数据windowWidth用来动态关联传递给<scale>的`to`对象，让缩小至最小时<scale>无论浏览器多大，始终处于中心位置。

# 9.<keep-alive>缓存导航列表里对应的几个路由组件，防止路由组件的销魂

