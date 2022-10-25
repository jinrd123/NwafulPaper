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

# 10.Wallpaper组件用<canvas>代替<p>渲染画面

逻辑方面说白了就是把以前用样式表现的东西，现在通过canvas绘制出来，props接收的和样式相关的属性不变，但需要多加两个属性`width`和`height`，因为<canvas>绘制之前需要设置其大小。然后组件方法就一个`render`（渲染canvas内容），在组件`mounted`以及`props`配置属性改变时调用。

## 存在bug：

目前在Home组件中给Wallpaper组件传的配置项指定的字体是我们在App.vue的<style>中用`@font-face`自定义的字体，首次进入项目页面，或者进入项目页面后刷新，canvas绘制文字时字体不生效，一旦页面大小改变（Wallpaper中用watch监视了props属性的改变，会重新调用`render`方法），也就是再次调用`render`方法，字体就会立即生效。也就是说`mounted`中调用`render`函数时没能成功使用自定义字体。怀疑原因是`@font-face`自定义的字体并不是定义了就直接加载，而是在应用时动态加载，所以我认为是第一次调用`render`时初次使用自定义的字体，这时候自定义字体还没有加载成功，我们就进行了<canvas>的绘制，所以没有生效。当以后再调用`render`方法时字体已加载完毕，就可以正常绘制了。

## 解决bug：

我们只需保证每次渲染时执行`drawColorWords`之前字体已经加载完毕即可。`new FontFace`返回一个字体对象，字体对象的方法`load`根据字体是否已经加载成功返回`Promise`对象，**这里的加载成功是建立在@font-face自定义字体基础之上的，所谓加载成功就是指执行了@font-face，所以new FontFace不能脱离@font-face独立存在，App.vue中的@font-face不可删除**。如果字体加载成功，返回的`Promise`成功的原因就是这个字体对象，加载失败返回什么就不重要了。

我们只需要每次渲染时执行`drawColorWords`之前`await new FontFace().load()`即可保证字体加载完毕。

### FontFace：

FontFace构造函数，接收三个参数

* 第一个参数，字体名（要与对应的`@font-face`的字体名一致）
* 第二个参数，`url()`，url内写字体资源文件，目前项目中我们通过`import fontUrl from 字体文件`的方式获得url的内容（这个也和`@font-face`中url指向的文件一致）
* 第三个参数，字体配置对象，暂时项目中未用到。

FontFace对象的方法：`load`，根据字体是否加载成功返回Promise。

### 留下优化思路：

其实只有props数据发生改变进行`render`时才需要重新加载字体，而监听屏幕大小的改变时调用`render`函数，此时字体并没有改变，所以`render`中没必要`await new FontFace().load()`

# 11.Wallpaper增加pattern渲染模式

以前Wallpaper的props接受的bgcolor和textcolor分别对应背景颜色和文字颜色，`fillStyle`设置为对应的颜色然后填充背景和文字即可。这种渲染模式记为`color`渲染模式。在Wallpaper的props增加mode属性进行标识。

现在拓展mode的pattern模式。说白了就是在canvas进行填充背景和文字时设置`fillStyle`不是单纯的颜色，而是用`ctx.createPattern`创建的`fillStyle`。

对于pattern渲染模式，Wallpaper接收`background`和`text`属性从单一颜色拓展为对象类型：

~~~js
background: {
    backgroundColor: "white",
    type: "line",
    patternColor: "#ddd",//线条颜色
    rotation: -45,//线条旋转
},
~~~

Wallpaper中的`render`函数根据`mode`属性进行不同模式的渲染：

~~~js
async render() {
  await this.loadFont();
  switch (this.mode) {
    case "color":
      drawColorWords(this.$refs.canvas, this.width, this.height, this.options);
      break;
    case "pattern":
      drawPatternWords(this.$refs.canvas, this.width, this.height, this.options);
      break;
  }
},
~~~

核心就在于`drawPatternWords`如何实现的：

说白了我们和曾经的`color`渲染模式的区别就在于一个`fillStyle`的构造。

接下来从Wallpaper开始走一遍渲染流程：

~~~js
async render() {
      await this.loadFont();
      /*
      	Wallpaper组件props接收的mode参数值为"pattern"决定了进行pattern渲染，执行drawPatternWords
      */
      switch (this.mode) {
        case "color":
          drawColorWords(this.$refs.canvas, this.width, this.height, this.options);
          break;
        case "pattern":
          drawPatternWords(this.$refs.canvas, this.width, this.height, this.options);
          break;
      }
    },
~~~

进入`@/utils/canvas.js`的`drawPatternWords`方法：

~~~js
/*
	说白了drawPatternWords的作用就是一个语义化的连接drawWords的中间函数
*/
export function drawPatternWords(...args) {
    drawWords("pattern", ...args);
}
~~~

`function drawWords`：

~~~js
/*
	说白了我们绘制的核心逻辑就是两步：先填充矩形给整个canvas渲染背景，再填充文字渲染内容,具体不同的绘制模式就是决定了fillStyle的不同
	所以我们下面需要chooseFillStyle函数获得不用模式的填充样式fillStyle
*/
export function drawWords(type, canvas, width, height, { fontSize, background, text, title, fontFamily }) {
    let context = createContext(canvas, width, height);
    /*
    	进入chooseFillStyle获取type渲染类型（"pattern"）的填充样式
    */
    const { backgroundFillStyle, textFillStyle } = chooseFillStyle(type, {
        background,
        text,
        context,
    });
    context.beginPath();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${fontSize}px ${fontFamily}`;
    /*
    	设置填充样式fillStyle之后渲染背景
    */
    context.fillStyle = backgroundFillStyle;
    context.fillRect(0, 0, width, height);
    /*
    	设置填充样式fillStyle之后渲染文字
    */
    context.fillStyle = textFillStyle;
    context.fillText(title, width / 2, height / 2);
}
~~~

`function chooseFillStyle`：

~~~js
function chooseFillStyle(type, { background, text, context }) {
    /*
    	对于color渲染模式，当初Wallpaper组件接收的background和text值就是单纯的一个颜色值，直接返回这个颜色值作为填充背景即可
    */
    if (type === "color") {
        return {
            backgroundFillStyle: background,
            textFillStyle: text,
        };
    /*
    	对于pattern渲染模式，说白了核心就是利用canvas原生方法ctx.createPattern创建一个填充样式，createPattern方法封装了原生方法ctx.createPattern，这里我们进入createPattern方法
    */
    } else if (type === "pattern") {
        return {
            backgroundFillStyle: createPattern(context, background),
            textFillStyle: createPattern(context, text),
        };
    }
}
~~~

`createPattern`：

~~~js
function createPattern(
    containerContext,
    { type, width = 50, height = 50, rotation = 0, ...options }
) {
    /*
    	createPattern的核心逻辑是对containerContext.createPattern这个原生获取填充样式的方法进行封装
    	这个原生方法的第一个参数可以是image或者canvas，第二个参数为重复方式。
    	对于pattern渲染模式，我们使用canvas去构造填充样式。
    	pattern模式下Wallpaper接收的background和text是一个对象，其中的type属性决定了我们构造canvas的样式，type为"line"时，background或者text对象的几个属性为：
    	    type: "line",
    		backgroundColor: "#89E089",
            patternColor: "currentColor",
            rotation: -45,
        这几个属性属于background或者text（两者自己的对象就包含四个属性），我们利用这几个属性去绘制一个canvas，这个canvas是用来做containerContext.createPattern方法的第一个参数的
    */
        
    /*
    	下面就是构建做containerContext.createPattern方法的第一个参数的canvas
    	line函数就是给新创建的canvas画线条，背景颜色对应backgroundColor，线条颜色对应patternColor，下面进入line函数
    */
    const canvas = document.createElement("canvas");
    const context = createContext(canvas, width, height);

    switch (type) {
        case "line":
            line(context, width, height, options);
            break;
    }

    /*
    	用上面构造的canvas给ctx.createPattern创建一个填充样式
    */
    const pattern = containerContext.createPattern(canvas, "repeat");
    /*
    	pattern.setTransform，原生方法，修改fillStyle的变换矩阵（类似于canvas的transform方法）
    */
    const matrix = transformMatrix(2, rotation);
    pattern.setTransform(matrix);

    return pattern;
}
~~~

（line函数进行线条绘制/pattern.setTransform进行canvas旋转变换）

line函数进行线条绘制：

`function line`：

~~~js
function line(context, width, height, { backgroundColor, patternColor }) {
    /*
    	line函数只是把canvas背景绘制成backgroundColor颜色，垂直画一个颜色为patternColor的线条
    	旋转相关的效果在上面createPattern函数中进行处理
    */
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = patternColor;
    context.beginPath();
    context.moveTo(50, 0);
    context.lineTo(50, 50);
    context.stroke();
}
~~~

pattern.setTransform进行canvas旋转变换：

`transformMatrix`：

~~~js
/*
	构造pattern.setTransform(matrix)的matrix参数，pattern.setTransform和ctx.transform方法参数类似，但pattern.setTransform参数是以一个数组形式，参数意义完全相同，只是格式不同。
	暂且先忽略dpr的值，其实abcd这样设置就等价于旋转变化用transform来表示而已（可回顾canvas学习笔记）。
*/
function transformMatrix(dpr, rotation) {
    const radian = (rotation * Math.PI) / 180;
    const matrix = {
        a: Math.cos(radian) * (1 / dpr),
        b: Math.sin(radian) * (1 / dpr),
        c: -Math.sin(radian) * (1 / dpr),
        d: Math.cos(radian) * (1 / dpr),
        e: 0,
        f: 0,
    };
    return matrix;
}
~~~

这样经过 画线+旋转（创建一个canvas上面画线，然后用这个canvas创建填充样式，让后让填充样式旋转变换），在`createPattern`函数中，我们就获得了一种`fillStyle`。`chooseFillStyle`函数中把背景和文字的fillStyle对象返回给`drawWords`函数，然后就是简单的填充样式设置之后的渲染了。