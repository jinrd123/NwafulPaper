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

# 12.canvas画质优化

曾经创建canvas时直接`canvas.height = height`，`canvas.width = width`。这样相当于创建的canvas独立像素（canvas学习笔记相关概念）就是width*height的。**单位空间内（这个空间是指周围的dom形成的参照大小）canvas独立像素的多少决定了canvas的视觉清晰度**

~~~js
export function createContext(canvas, width, height) {
  /*
  	我们创建2width*2height独立像素的canvas
  	与之对应canvas的宽高（相对于周围dom）也变成了原来的2倍
  	我们需要canvas的相对dom的大小还是width*height的效果，就用过canvas.style.width去设置，设置为width*height(px)，就完成了在width*height(px)的dom空间内canvas有了更多的独立像素
  	但由于canvas绘制时的坐标以及长短都是基于独立像素的，所以要想处理后的canvas坐标与原来的canvas视觉效果统一，还需要执行context.scale(2, 2);
  */
  canvas.height = height * 2;
  canvas.width = width * 2;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  const context = canvas.getContext("2d");
  context.scale(2, 2);
  return context;
}
~~~

## `createPattern`封装方法中调用`transformMatrix`第一个参数的传值为2：

其实通过createPattern原生方法创建的`fillStyle`也是基与canvas独立单位填充时进行覆盖的。因为我们创建的canvas是独立像素在x和y方向都是2倍“密度”，所以进行transform修改pattern变换矩阵（同canvas变换矩阵）时a、b、c、d都除2。（由canvas学习笔记可知这个都除2的操作相当于canvas（pattern）缩放，让背景的线条更密集）。详细原理不很清楚（为什么时除2不是乘2，不清楚填充时fillStyle与canvas的匹配机制是px对应还是独立单位对应），但对应关系一定是这样。

# 13.Wallpaper增加image渲染模式

`drawImageWords`的绘制逻辑就是先执行`context.drawImage(image, 0, 0, width, height);`绘制图片作为背景，然后再在canvas中心绘制文本即可。

在执行`drawImageWords`之前，需要图片已经加载完毕

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
    case "image":
      /*
      	用await等待loadImage函数执行完毕
      */
      await this.loadImage();
      drawImageWords(this.$refs.canvas, this.width, this.height, { ...this.options, image: this.image });
      break;
  }
},
~~~

`loadImage`函数我认为写的就很精妙：需要充分理解`await`的作用：**等待await后面的函数执行完毕才继续执行后文代码**。

我们的目标就是希望image对象完全加载（表现就是执行onload函数），所以我们等待图片的生命周期onload函数执行完毕的代码：

~~~js
await new Promise((resolve) => {
    image.onload = function() {
        resolve(image);
    }
})
~~~

~~~js
async loadImage() {
  this.image = await new Promise((resolve)=>{
    const newImage = new Image();
    newImage.src = this.options.imageURL;
    newImage.onload = function() {
      resolve(newImage);
    }
  })
}
~~~

**我认为这也是一个模板型的代码：等待某些资源的某个生命周期（这个生命周期最好有相关的回调函数）：**

~~~js
await new Promise((resolve) => {
    资源.生命周期函数(){
        resolve()
    }	
})
~~~

# 14.背景用图片进行绘制时进行canvas与image的大小匹配

我们的目标是在canvas上绘制图片时，在不对图片进行改变宽高比的拉伸的情况下，尽可能多的展示出来图片的内容。

`context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height)`，说白了我们就是要裁剪图片，也就是确定`sw`和`sh`

先比较图片和canvas的宽高比，如果canvas比较宽，那我们就以图片的宽为主：`sw = imageWidth`，这是为了尽可能多的展示出来图片的内容。

我们毕竟是要把图片渲染到canvas上，为了保证不改变呈现出来的图片的宽高比，就是要保证大小为`sw*sh`的图片和canvas的宽高比相同，我们令`sh = sw * contextAspect`。这样就保证执行`ctx.drawImage`时`sw*sh`的图片绘制到`width*height`的canvas上是等比例缩放。

~~~js
function drawImage(context, image, width, height) {
    const { width: imageWidth, height: imageHeight } = image;
    const imageAspect = imageHeight / imageWidth;
    const contextAspect = height / width;
    let sw, sh;
    if (imageAspect > contextAspect) {
        sw = imageWidth;
        sh = sw * contextAspect;
    } else {
        sh = imageHeight;
        sw = sh / contextAspect;
    }
    const sx = (imageWidth - sw) / 2;
    const sy = (imageHeight - sh) / 2;
    context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
}
~~~

其实这个适配算法的形象理解为：我们脑中想象，让图片缩小至完全在canvas内部的中心位置（此时图片的两条对边紧贴canvas的两条边，具体是宽边紧贴还是高边紧贴那就和图片和canvas的宽高比有关了），我们想在canvas上呈现出来的图片的部分，就是：此时把图片等比例放大，直至另外两个在canvas内部的图片的对边紧贴canvas，此时canvas内部的图片部分，就是我们需要绘制的部分。

# 15.删除Scale组件，Scale组件负责的缩放以及定位功能用Home组件的一个<div>实现；给Screen组件增加图片边框

首先我们删除Scale组件，其缩放和定位由一个div完成的话，就把原来Scale组件中对于定位属性和大小属性的计算逻辑需要移动到Home组件中，所以Home组件中transform属性实际上就是Scale中的计算逻辑：

~~~js
transformed() {
  const { from, to } = this.dimension;
  const {
    x: fromX,
    y: fromY,
    width: fromW,
    height: fromH,
    scale: fromS,
  } = from;
  const { x: toX, y: toY, width: toW, height: toH, scale: toS } = to;
  return {
    x: map(this.progress, 0, 1, fromX, toX),
    y: map(this.progress, 0, 1, fromY, toY),
    width: map(this.progress, 0, 1, fromW, toW),
    height: map(this.progress, 0, 1, fromH, toH),
    scale: map(this.progress, 0, 1, fromS, toS),
  };
},
~~~

在这个版本之前，from、to对象中to的width和height代表是滚轮滚动后Wallpaper最终的大小（`width: this.windowWidth*scale;height: this.windowWidth * scale`），但现在from还是代表全屏，to只是代表Wallpaper矩形比例的变化（`width: this.windowWidth;height: this.windowWidth * macAspect`，width和height并没有乘scale）,所以现在Home组件中`transform`属性实时计算的width和height只是一种Wallpaper比例的呈现（鼠标滚动之前宽高比就是浏览器宽高比，且宽就是浏览器宽；向下滚动至极限时，宽高比就是mac机的宽高比）。在Home组件中，我们把transform实时计算的宽高传递给Screen和Wallpaper作为宽高，然后Home组件中的div通过`transform: scale(${transformed.scale}, ${transformed.scale})`进行缩放。这里说这个form和to就是因为曾经在scale组件中current计算的width和height一直都是定值from.width和from.height，计算逻辑移动到Home组件里了，transform.width和transfrom.height却成了用map函数实时计算的了，可能有点懵：宽高都动态传递给screen和Wallpaper了，那为什么还要div中使用transform进行缩放，那岂不是重复缩放了，其实不然，因为我们修改了to对象，to只是代表一种宽高比例的变化，而不是具体大小的变化，宽一直都是全屏宽，所以传给screen和Wallpaper的大小仍然某种程度上还是和以前一样，是一个定值。

Screen组件给Wallpaper添加图片边框

Screen组件：

~~~js
borderWidth: `${border.top}px ${border.right}px ${border.bottom}px ${border.left}px`,
borderStyle: 'solid',//默认值是none，需要设置为solid才有边框
borderImage: `url(${src})`,
borderImageSlice: `${meta.top} ${meta.right} ${meta.bottom} ${meta.left}`,
~~~

我们通过borderImage给wallpaper增加边框，borderImage和borderImageSlice属性配合使用，borderImageSlice是指把borderImage指定的图片按上、右、下、左的顺序画四条线，把图片分成9宫格，中间的一块默认丢弃，原图剩下四边四角，四角默认直接呈现应该是，四边默认会拉伸（这些都可以通过相关属性进行设置），也就是原图切出来的四边的图片拉伸后作为一个border边。光依靠上面这四个设置（边框不为none，有具体的边框宽度，用图片作为边框外观），其实我们就完成了边框的添加。

目前的难点就是：

我们的canvas大小是适配屏幕的，所谓屏幕适配就是浏览器展示多少，我们根据浏览器展示的大小获得一个大小，也就是说我们如果进行了页面缩放，我们浏览器中展示了很大的空间，其它的普通dom元素视觉上都变得很小（实际原因是浏览器展示范围变大），此时我们的canvas依然在我们眼中大小恒定，不会因为浏览器的大小缩放而在视觉上也随之缩小。我们希望我们给canvas添加的边框同样也适配屏幕，所以边框宽度就不能直接用borderImageSlice切图时用的meta（meta中切图时用的是边框的真实大小），图片Screen中border计算属性用来计算适配屏幕的边框宽度：

~~~js
border() {
  /*
  	containerWidth和containerHeight是Home组件中传过来的canvas的真实大小
  */
  const { width: containerWidth, height: containerHeight } = this;
  /*
  	meta中的大小数据都是指边框图片的真实大小，left、right、bottom和top指borderImageSlice切图时图片边缘距离对应切线的大小，我们可以用imageWidth - sliceLeft - sliceRight计算出边框图经过切图后中心部分留出了多少宽度用来呈现canvas
  */
  const {
    width: imageWidth,
    height: imageHeight,
    left: sliceLeft,
    right: sliceRight,
    bottom: sliceBottom,
    top: sliceTop,
  } = this.meta;
  const contentWidth = imageWidth - sliceLeft - sliceRight;
  const contentHeight = imageHeight - sliceBottom - sliceTop;
  /*
  	因为canvas的大小是适配屏幕的，我们让边框适配屏幕只需要让边框的大小和canvas保持固定一个比例即可
  	边框需要缩放的比例 = canvas真实大小 / 边框图片给canvas留的空间 = containerWidth / contentWidth
  */
  const ratioX = containerWidth / contentWidth;
  const ratioY = containerHeight / contentHeight;
  const left = Math.ceil(sliceLeft * ratioX);
  const right = Math.ceil(sliceRight * ratioX);
  const top = Math.ceil(sliceTop * ratioY);
  const bottom = Math.ceil(sliceBottom * ratioY);
  return {
    left,
    right,
    top,
    bottom,
    width: containerWidth,
    height: containerHeight,
  };
},
~~~

因为通过borderImage添加的边框一般都比较大，所以为了保证wallpaper的canvas仍然位于原先的位置：我们需要在Screen中用定位向上向左移动一下增加了边框的元素，最终Screen组件结构：

~~~html
<template>
  <div
    class="container"
    :style="{
      /*
            消除边框较大带来的内容偏移
      */
      left: -border.left + 'px',
      top: -border.top + 'px',
      /*
      		单纯大小的设置
      */
      width: border.width + 'px',
      height: border.height + 'px',
      /*
      		添加图片边框      
      */
      borderWidth: `${border.top}px ${border.right}px ${border.bottom}px ${border.left}px`,
      borderStyle: 'solid',
      borderImage: `url(${src})`,
      borderImageSlice: `${meta.top} ${meta.right} ${meta.bottom} ${meta.left}`,
    }"
  >
    <slot></slot>
  </div>
</template>
~~~

# 16.防止浏览器滚动条的出现

默认body标签的`overflow`属性值为`auto`，也就是当body内的元素超出body时，自动添加滚动条，设置为`overflow: hidden;`即可。

# 17.bug修复

## bug1:鼠标滚动缩放wallpaper时，canvas闪动（不能直接呈现出最终大小）

bug具体描述：因为Scroll组件的存在，我们观察此bug还是很清晰，我们注释掉Scroll组件，会清晰的发现：当我们滚动鼠标滚轮缩小Wallpaper时，第一瞬间缩小后的Wallpaper和缩小前的Wallpaper宽高比例相同，然后突然发生变化至width和height指定的理论宽高比；鼠标滚轮滚动放大Wallpaper时，同理，第一瞬间和放大前的宽高比相同，然后突然变化至理论宽高比。

原因：Home组件中`transform`计算属性根据滚动进度`progress`动态计算Wallpaper的宽高以及包裹Scroll组件的div的缩放比例scale。因为在鼠标滚动时`progress`值发生变化，导致`transform.scale`变化，会直接完成Wallpaper的缩放，但`progress`值发生变化同样导致了传递给Wallpaper的`height`值发生变化，Wallpaper中对width属性的监视，触发了`render`函数，导致Wallpaper重新渲染，高度再次变化，也就形成了我们看到的闪动bug。逻辑上其实这样写没问题，毕竟计算机高速计算，两者不应该这种顺序感这么强才对，应该就是一瞬间两者完成，不会闪动。究其原因是因为`render`函数耗时太大，准确来说是`render`函数加载字体耗时太大。不管每次渲染是否更换了新字体，我们都把字体重新加载一遍：

~~~js
async render() {
  /*
  	render函数体第一步：执行loadFont
  */
  await this.loadFont();
  switch (this.mode) {
    case "color":
      drawColorWords(this.$refs.canvas, this.width, this.height, this.options);
      break;
    case "pattern":
      drawPatternWords(this.$refs.canvas, this.width, this.height, this.options);
      break;
    case "image":
      await this.loadImage();
      drawImageWords(this.$refs.canvas, this.width, this.height, { ...this.options, image: this.image });
      break;
  }
},
~~~

`loadFont:`

~~~js
async loadFont() {
  /*
  	耗时关键：等待新字体加载完毕（new FontFace().load()函数）
  */
  this.fontFace = await new FontFace(this.options.fontFamily, `url(${this.options.fontURL})`).load();
},
~~~

所以我们要对字体加载进行优化：

~~~js
async loadFont() {
  /*
  	根据字体对象的loaded属性判断字体如果已经加载完毕就不再加载了
  */
  if(this.fontFace && this.fontFace.loaded) {
    return;
  }else {
    this.fontFace = await new FontFace(this.options.fontFamily, `url(${this.options.fontURL})`).load();
  }
},
~~~

经过字体加载的优化，目前对于`"color"`和`"pattern"`绘制模式，都不会出现闪动bug了，但是对于`"image"`绘制模式，还是会出现闪动bug，肯定是因为`loadImage();`函数的调用消耗了大量时间。需要进行优化：

~~~js
async loadImage() {
  /*
  	根据图片对象的complete属性判断图片如果加载完毕就不再加载了
  */
  if (this.image && this.image.complete) {
    return;
  } else {
    this.image = await new Promise((resolve) => {
      const newImage = new Image();
      newImage.src = this.options.imageURL;
      newImage.onload = function () {
        resolve(newImage);
      };
    });
  }
},
~~~

但是目前的优化逻辑，如果传入新的图片或者字体，也会判断为不再加载新的资源。所以还要修改一个逻辑，在检测到options发生变化时，让`this.image`和`this.fontFace`置为`undefined`，这样或许不是最有方案，但可以确保在新的图片或者字体传入时，我们会进行加载。

~~~js
options: {
  deep: true,
  handler(oldData, newData) {
    if (newData.fontURL !== oldData.fontURL) this.fontFace = undefined;
    if (newData.imageURL !== newData.imageURL) this.image = undefined;
    this.render();
  },
},
~~~

## bug2:如果把Screen组件注释掉，手动拉伸浏览器致使Wallpaper大小于位置进行变化，会出现边框残影，我认为应该是浏览器渲染速度低导致的，应该不是我们的错

创建canvas的上下文时不加边框即可。

# 18.Screen组件内使用element-ui走马灯组件呈现Wallpaper

其实简简单单用<el-carousel>和<el-carousel-item>去包裹<Wallpaper>即可，但是却一直出不来效果，经过排查发现因为Wallpaper组件中canvas标签用了一个div进行包裹，这个div使用了`flex`布局且`justify-content: center;`导致的。canvas外层的div结构已经删除。

# 19.提取Scale组件，完成定位功能（fixed可选）和缩放功能

Scale组件接收from和to两个状态对象和一个progress值，组件内部完成当前状态的计算。所以在把计算逻辑集成到Scale组件之后，Home组件需要得到当前的Scale的状态值（width和height）并传给Wallpaper和Screen（Home组件中维护data项screenSize对象）。所以使用全局事件总线给Home组件传值：**把`this.$emit`放在了transform计算属性里，经过测试，组件初始化时computed会执行一次，然后在每次transfrom变化时会再次执行，transform变化就代表Scale的当前状态值（width、height）发生改变，正好就传给父组件，比把$emit放在updated生命周期中要好（触发更加准确）。**

还有一个知识点：因为Scale组件的定位功能我们希望通过一个布尔值fixed来选择性使用（如果fixed为false，我们就只根据from、to、progress来计算宽高的当前状态），所以我们可以使用`:style`的数组写法：

~~~html
<div
:style="[
    fixed && {
    position: 'absolute',
    left: transformed.x + 'px',
    top: transformed.y + 'px',
    zIndex,
    },
    {
    transformOrigin: 'left top',
    transform: `scale(${transformed.scale}, ${transformed.scale})`,
    width: transformed.width + 'px',
    height: transformed.height + 'px',
    },
    styles,
]"
>
<slot />
</div>
~~~

（**数组里可以包含若干个样式集合对象，而且样式对象的生效与否可以通过布尔值动态控制：`:style="[bool&&{}]"`**）而且在计算`transfrom`的返回值时，我们使用了相同的语法结构：

~~~js
const boundingBox = {
    /*
    	若fixed为false，就没有后面的对象，说白了 fixed&&{} 就等价于if(fixed)return {}
    */
    ...(fixed && { x: map(progress, 0, 1, fromX, toX) }),
    ...(fixed && { y: map(progress, 0, 1, fromY, toY) }),
    width: map(progress, 0, 1, fromW, toW),
    height: map(progress, 0, 1, fromH, toH),
    scale: map(progress, 0, 1, fromS, toS),
};
~~~

# 20.优化canvas清晰度

我们增加canvas独立像素密度的时候，并不是增加的密度越大越好，如果太大，性能会降低很多，经过测试，确实是越大越清晰没毛病。

但终归有一个比较合适的值，适配设备的物理像素，且性能较好。

` window.devicePixelRatio`（pixel：[ˈpɪks(ə)l]像素）：设备中多少个物理像素来渲染一个css像素。

我们让canvas独立像素与css像素的比值等于` window.devicePixelRatio`。（一种选择而已，设备如果devicePixelRatio高，也就是物理像素多，那自然我们canvas独立像素密度扩展的也越大，越清晰）

# 21.给element-ui组件修改样式

实际上对于element-ui组件库里的组件，**组件名其实就是对应的这个组件的类名**，例如让导航组件<el-menu>里的<el-menu-item>靠右排列，那么直接在style里写：

~~~css
.el-menu {
  display: flex;
  justify-content: flex-end;
}
~~~

# 22.实现Editor页面的Wallpaper预览

如果从Home页面点击Wallpaper，则进入Editor页面，并且呈现点击的Wallpaper，如果从导航栏进入Editor页面，则默认呈现一个Wallpaper即可。

这里就涉及Home页面到Editor页面路由转跳时如何传递信息，考虑到Wallpaper的配置对象比较复杂，没有选择路由传参，我选择了浏览器会话存储结合路由组件`activated`和`deactivated`两个生命周期完成预期效果。

我们在Home组件中如果点击了Wallpaper，那么在路由转跳之前进行会话存储`sessionStorage.setItem("wallpaperInfo", JSON.stringify(example));`，然后在进入Editior页面的时候读取这个对象传给Wallpaepr即可，但是不能在`mounted`生命周期中进行读取，因为Editor页面是被<keep-alive>缓存的路由组件（绘制进度需要保存），所以要在`activated`中进行读取（有则读，无则读取组件存储的Wallpaper信息），然后在`deactivated`路由组件失活时清除会话存储`sessionStorage.removeItem("wallpaperInfo")`清除状态以便下一次进入Editor时进行逻辑判断（会话存储有则读，无则读取组件存储的Wallpaper信息）。

但是在Editor中Wallpaper组件的大小和定位是我们写死的。Wallpaper的大小我们设置了屏幕宽高。使用了一个div进行缩放，并把Wallpaper平移至<el-main>预览区域的中心。

计算缩放比例以及平移距离：

~~~js
computed: {
  transformed() {
    const padding = 30;
    /*
    	mainHeight和mainWidth为预览区域的大小
    */
    const mainHeight = this.windowHeight - 61 - 200;
    const mainWidth = this.windowWidth - 300;
    /*
    	预览区域给Wallpaper一些边距，减去padding即为呈现Wallpaper区域的大小
    */
    const width = mainWidth - padding * 2;
    const height = mainHeight - padding * 2;
    /*
    	这里为缩放的核心逻辑：缩放后的Wallpaper需要能在Wallpaper区域（width，height）放的开
    	所以我们选择sh,sw中较小的那一个（缩小的多）比例进行缩小
    */
    const sh = height / this.windowHeight;
    const sw = width / this.windowWidth;
    const scale = Math.min(sh, sw);
    /*
    	上面的scale保证了缩放后的Wallpaper小于width*height的空间，只需要Wallpaper居中即可
    	this.windowWidth * scale即为缩放后Wallpaper的视觉宽度
    	this.windowHeight * scale即为缩放后Wallpaper的视觉高度
    	利用translate让元素居中的简单计算：
    	translateX = ( 容器宽度 - 元素宽度 ) / 2
    	translateY = ( 容器高度 - 元素高度 ) / 2
    */
    const translateX = (mainWidth - this.windowWidth * scale) / 2;
    const translateY = (mainHeight - this.windowHeight * scale) / 2;
    return {
      scale,
      translateX,
      translateY,
    };
  },
},
~~~

# 23.AttributeTree组件的实现（Editor页面完成对Wallpaper配置属性的修改）&&实现color模式的修改树数据结构

这是一个基于（结合）数据结构创作的组件，也就是说**根据不同的数据结构我们可以获得组件不同的表现（结构、功能）**。

数据结构：

~~~js
export const color = {
  type: "container",
  children: [
    {
      type: "text",
      key: "title",
      name: "Title",
      placeholder: "Please input title",
    },
    {
      type: "color",
      key: "text",
      name: "Title Color",
    },
    {
      type: "color",
      key: "background",
      name: "Background Color",
    },
    {
      type: "number",
      key: "fontSize",
      name: "Font Size",
    },
  ],
};
~~~

`color.children`是我们想要遍历生成组件的真实数据部分，我们的总体思路是`AttributeTree`组件的基本结构是遍历数据结构生成自身，就像递归一样，一个children项我们希望生成一个`AttributeTree`组件，所以我们构造color对象时，就不可能让`children`里的子项成为`color`的最上层项，这样就会造成`AttributeTree`无脑遍历生成`AttributeTree`无限嵌套，这里的逻辑总结比较抽象，至于数据结构为什么要上面那样设计，直接看`AttributeTree`组件的结构：

~~~js
<template>
  <div v-if="options.type === 'container'">
    <attribute-tree
      v-for="child in options.children"
      :options="child"
      :key="child.key"
      :values="values"
    />
  </div>
  /*
  	field组件就是一个壳子，里面一个span，一个slot，flex布局justify-content: space-between，说白了就是给slot按钮加一个name，并且name和按钮在一行的两端，比较美观
  */
  <feild v-else :name="options.name">
    /*
    	真实数据对象（children的子对象）的type属性值控制生成按钮的种类
    	key属性值用来绑定values对象的对应属性，也就是这个按钮用来对values对象的这个属性进行修改
    */
    <el-input
      v-if="options.type === 'text'"
      :placeholder="options.placeholder"
      v-model="values[options.key]"
    />
    <el-color-picker
      v-if="options.type === 'color'"
      v-model="values[options.key]"
    />
    <el-slider
      v-if="options.type === 'number'"
      v-model="values[options.key]"
      :min="10"
      :max="300"
      :style="{ width: 200 + 'px' }"
    >
    </el-slider>
  </feild>
</template>
~~~

结构分析：顶层结构是由`v-if`和`v-else`控制的同级的互斥的<div v-if="options.type === 'container'">和<feild v-else :name="options.name">，也就是说如果传给`AttributeTree`组件的`options`对象的`type`属性值为`container`，那么就遍历`options.children`生成当前`AttributeTree`的子`AttributeTree`，直到传给`AttributeTree`的`options`对象的`type`属性值不为`container`（也就是把children里的真实数据对象传给`AttributeTree`了），就说明当前的这个`AttributeTree`组件的内容就不是`AttributeTree`了，而是生成一些功能性的东西（渲染<feild v-else :name="options.name">那部分），也就意味着`AttributeTree`组件递归生成`AttributeTree`的结束。

所以说我们写一个顶级的`AttributeTree`组件，只要传给他设计好的`options`对象，就能生成与`options`对象相匹配的按钮结构树。

（`AttributeTree`除了接收`options`对象之外，还接收一个`values`对象，并且在生成壳子`AttributeTree`（v-if="options.type === 'container'"）时会原封不动的把`values`传递下去，直到生成的功能按钮绑定了`values`的某个属性，这个`values`对象就是我们顶级`AttributeTree`的父组件想利用`AttributeTree`去维护的数据对象：**Editor页面维护的example对象，也就是Wallpaper的配置对象，我们通过props传给`AttributeTree`，单向数据流props如果传递的是对象的话，子组件对props属性的修改会影响到父组件中原对象的值，虽然不提倡，但是可以，我们这里也采用的这种方式实现子组件（`AttributeTree`）传值给父组件（`Editor`），然后example属性值变了，自然起到了修改Wallpaper渲染配置的效果**）

我们在Editor页面根据`this.mode`获取对应的数据结构作为`AttributeTree`的`options`（`options`决定生成的`AttributeTree`的结构），本次只更新了`this.mode == "color"`时的数据结构，image和pattern模式的对应结构还未开发。

`Editor-computed-getAttributeOptions`：

~~~js
attribute() {
  /*
  	当前版本因为this.example.mode == "image" / "pattern" 时计算属性attribute获取不到值，所以Home页面点击color模式外的另外两个Wallpaper会报错
  */
  return getAttributeOptions(this.example.mode);
},
~~~

`utils/attribute/index.js - getAttributeOptions`：

~~~js
import { color } from "./color";
/*
	color即为最上面呈现的数据结构
*/
export function getAttributeOptions(type) {
  if (type === "color") {
    return color;
  }
  /*
  	image和pattern模式待开发
  */
}
~~~

# 24.实现image上传功能

## 前置知识：

### H5 FileReader对象进行文件操作

FileReader对象用于操作File对象或者Blob对象。

#### File对象的来源：

~~~html
/*
	file类型的input的文件上传后触发的onchange事件接收参数node，即为这个input结点
	input结点的files数组里面存放的就是上传的文件对应的File对象
*/
<input type="file" onchange="getInfo(node)">
<script>
	function getInfo(node) {
        console.log(node.files)
    } 
</script>
~~~

#### FileReader对象的相关API：

* `readAsDataURL(FileObj)`：将文件处理成URL格式的Base64字符串（**说白了就是一个字符串，这个字符串可以代替某些标签的url属性，虽然不是url，但起到同样的效果**，例如这个字符串给image标签的src属性），一般FileReader对象处理图片类型的File对象时选择。
* `readAsText(FileObj)`：将文件按照文本文件进行处理（以获取文本内容），一般FileReader对象处理文本类型的File对象时选择。

* `...`：还有其它API对应处理不同的File对象，用到再说。

#### FileReader对象的相关属性（指定生命周期的对应回调）：

* `FileReader.onload`：指定读取文件成功后执行的回调
* `...`：其他生命周期属性，用到再说。

#### **API与生命周期属性的关系**

*两者是相互对应，密不可分的，因为我们的FileReader对象使用了某个API操作了某个文件之后，对应不同的API此时FileReader对象有不同的表现，那这个表现具体在哪里呈现就需要结合生命周期函数。举例来说：`ImgFile`是一个图片类型的文件对象，`fr`是一个`FileReader`实例，先执行`fr.readAsDataURL(ImgFile)`，执行之后，我们可以在`onload`指明的回调函数中接收到一个事件对象`e`，`e.target.result`就是base64格式的字符串。如果是`readAsText`处理的文本文件，`e.target.result`就是对应的文本内容。*

**总而言之就是不同的API处理文件之后，对应生命周期回调中`e.target.result`（处理结果）不同**

拓展（另一个获取文件url的方法）：`window.URL.createObjectURL(FileObj)`方法可以返回一个文件对象的url。

## 具体实现：

`AttributeTree`组件中增加渲染结构的种类，处理图片的上传：

~~~js
<el-upload
      v-if="options.type === 'image'"
      class="upload"
      action=""
      :auto-upload="false"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      :limit="1"
    >
      <el-button size="small" type="primary"> select image </el-button>
    </el-upload>
~~~

<el-upload>原本是用来上传文件的组件，但是我们暂时用不到上传功能，所以`action`属性也设置了空，说白了如果不指定`action`，也就是不使用上传功能的话，<el-upload>只是单纯对`file`类型的<input>的简单封装，说白了就是我们可以通过<el-upload>的一些事件回调获取到文件对象（说白了就是<input type="file">借用了一下样式以及事件封装而已）：

~~~js
/*
	on-change事件的回调函数（参数详情去element-ui官方文档查询即可）
*/
handleChange(file) {
  /*
  	回调的核心逻辑就是对图片类型的文件对象的处理：使用FileReader对象
  	并且完成对values（wallpaper配置对象）的修改
  */
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = (event) => {
    console.log(event);
    const imageURL = event.target.result;
    this.values.imageURL = imageURL;
  };
},
~~~

## bug避雷

按理论上来讲上面的逻辑已经完成了图片上传之后对Wallpaper的属性修改，自然进行新的渲染，但是意外的是，Wallpaper组件并没有渲染新的图片，经过排查，问题代码：

~~~js
watch: {
  options: {
    deep: true,
    handler(oldData, newData) {
      if (newData.fontURL !== oldData.fontURL) this.fontFace = undefined;
      /*
      	这里并没有执行this.image = undefined，从而进行新的渲染时，没有加载新的图片
      */
      if (newData.imageURL !== newData.imageURL) this.image = undefined;
      this.render();
    },
  },
      
  ...
  
}
~~~

**vue的watch，如果深度监视一个对象，这个对象的属性值发生变化会被监听到，但是`handler`函数的`oldData`和`newData`，官方自然有对其合理性的解释....但对程序员来说这就是简简单单的vue漏洞！**

所以上面错误代码把`if`判断删除即可正常执行上传图片的渲染，但这里肯定也消耗了一定效率。

# plus：渲染image上传按钮时field组件设置单独的样式

情景：此前我们field组件的布局样式是写死的：flex布局，两头左边标题，右边按钮，对于前面的颜色选择器，以及input等都适用，但是现在对于文件上传，上传文件之后文件名列在按钮之下，如果还是以前的布局就非常不美观。所以需求：**让field组件针对一些渲染情况有不同的样式表现**：

使用`:class`的数组形式：`:class="[]"`**数组里面存放若干个变量，变量的值为字符串类型的类名（不能直接写字符串类名，所以要用data维护几个变量，其值对应一些类名）**。

`field.vue`：

~~~vue
<template>
  /*
		通过props接收的flex变量的值决定使用哪个class样式
		生成image上传相关的按钮时控制flex值即可
			<feild :flex="options.type === 'image' ? 'col' : 'row'">
		类名需要用data中的一个变量去存放
  */
  <div :class="[containerClass, flex === 'row' ? rowClass : colClass]">
    <span class="input-label">{{ name }}</span>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    flex: {
      default: "row",
      type: String,
    },
  },
  data() {
    return { containerClass: "container", rowClass: "row", colClass: "col" };
  },
};
</script>

<style scoped>
.input-label {
  display: inline-block;
  padding-right: 0.5em;
}

.container {
  padding: 0.25em 0.5em;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.col > span {
  margin-bottom: 0.5em;
}
</style>
~~~

# 25.代码重构

## 核心

此前Wallpaper的绘制模式为`color`、`pattern`、`image`，背景与文字的模式是统一的，绘制无法分离。

需求：重构Wallpaper的`options`配置对象的结构与`render`方法，实现背景与文字的绘制模式分离。

`Wallpaper-props-options`（Wallpaper配置对象新结构示例）：

~~~js
examples: [
  /*
  		每个配置对象包含text、background两个字对象，绘制模式的区别在于子对象的type属性：
  			type:"none":原color绘制模式，简单的颜色填充
  			type:"line":原pattern绘制模式，颜色填充之后用线条进行装饰
  			type:"image":原image绘制模式，用图片进行填充
  */
  {
    text: {
      content: "How are you?",
      fontSize: 200,
      fontFamily: "Luckiest Guy",
      fontURL,
      type: "none",
      color: "#532582",
    },
    background: {
      type: "none",
      color: "#fcbc23",
    },
  },
  {
    text: {
      content: "How are you?",
      fontSize: 200,
      fontFamily: "Luckiest Guy",
      fontURL,
      type: "line",
      rotation: -45,
      width: 25,
      height: 25,
      foregroundColor: "currentColor",
      color: "#89E089",
    },
    background: {
      color: "white",
      foregroundColor: "#ddd",
      type: "line",
    },
  },
  {
    text: {
      content: "How are you?",
      fontSize: 200,
      fontFamily: "Luckiest Guy",
      fontURL,
      type: "none",
      color: "#fff",
    },
    background: {
      type: "image",
      imageURL: "https://i.loli.net/2021/09/04/drBtUVNhlq87Rwc.jpg",
    },
  },
],
~~~

Wallpaper组件内方法变化：

`render`函数的逻辑就是调用`drawWallpaper`方法，`drawWallpaper`方法根据Wallpaper的配置对象自动选择背景与文字的绘制模式。

`drawWallpaper`：

~~~js
export function drawWallpaper(canvas, width, height, options) {
  const context = createContext(canvas, width, height);
  const { text: textOptions, background: backgroundOptions } = options;
  /*
  		drawWallpaper的核心逻辑就是对drawBackground、drawText方法的调用。
  		drawBackground和drawText就是对背景与文字进行绘制，只是在具体绘制之前根据backgroundOptions、textOptions的"type"属性判断如何进行绘制即可
  */
  drawBackground(context, width, height, backgroundOptions);
  drawText(context, width, height, textOptions);
}
~~~

## plus

对于资源的加载等一些方法也进行了重写，没有什么逻辑变化。

当前没有对AttributeTree组件的结构配置对象进行修改，而且AttributeTree组件内部绑定的值也需要修改，所以Editor页面会报错。Wallpaper的重构已经完成，没有问题。

# 25.AttributeTree组件结构以及相关数据结构重构

## 相关数据结构（数据结构肯定要结合AttributeTree组件的相关结构逻辑，但我们先单独分析数据结构）：

在顶层对象（`type:"container"`）与真实的结构对象之间再加一层中间对象（`type:"section"`），这一层的功能在于区分真实的结构对象是文本相关的配置还是背景相关的配置。

最重要的当然还是真实的功能按钮对应的结构对象，也就是`section`对象的`children`组数属性的数组项（最底层对象）。

~~~js
export function getAttributeOptions(textType, backgroundType) {
  return {
    type: "container",
    children: [
      {
        type: "section",
        name: "Text",
        /*
        	children数组的每一项都对应生成一个功能按钮（绑定wallpaper的一个配置属性值）
        	追踪到getTextOptions( "none" / "line" ) （ getBackgroundOptions(backgroundType)逻辑结构完全类似 ）
        */
        children: getTextOptions(textType)
      },
      {
        type: "section",
        name: "Background",
        children: getBackgroundOptions(backgroundType)
      }
    ]
  };
}

export function getTextOptions(type) {
  return [
    /*
    	下面这两个对象分别对应Wallpaper的 文本内容 和 文本字体大小
        与 "type" 无关，是必须属性
    */
    {
      type: "text",
      key: "text.content",
      name: "Content",
      placeholder: "Please input title"
    },
    {
      type: "number",
      key: "text.fontSize",
      name: "Font Size",
      min: 10,
      max: 300
    },
    /*
    	根据 "type" 值的不同获取不同的属性对象
    	追踪到getTextStyleOptions方法（返回包含多个配置对象的数组，这里使用...进行数组解构获取配置对象）
    */
    ...getTextStyleOptions(type)
  ];
}

export function getTextStyleOptions(type) {
  /*
  		type值的分支：
  			"none" / undefined : 简单返回一个背景颜色的配置对象
  			other : 返回 getPatternOptions(type, "text"),为了代码复用，封装了getPatternOptions方法，getPatternOptions方法也可以生成背景相关的配置对象，所以第二个参数需要指定"text"
  */
  if (!type || type === "none") {
    return [
      {
        type: "color",
        key: "text.color",
        name: "Color"
      }
    ];
  } else {
    return getPatternOptions(type, "text");
    /*
    	追踪到getPatternOptions(type, "text")
    */
  }
}

export function getBackgroundOptions(type) {
  if (!type || type === "none") {
    return [
      {
        type: "color",
        key: "background.color",
        name: "Color"
      }
    ];
  } else if (type === "image") {
    return [
      {
        type: "image",
        key: "background.imageURL",
        name: "Image"
      }
    ];
  } else {
    return getPatternOptions(type, "background");
  }
}

export function getPatternOptions(type, prefix) {
  /*
  		目前只设计了type值为"line"的情况，返回四个配置对象
  			first:背景颜色
  			second:线条颜色
  			third:线条间距
  			fourth:线条倾斜弧度
  */
  if (type === "line") {
    return [
      {
        type: "color",
        key: `${prefix}.color`,
        name: "Background Color"
      },
      {
        type: "color",
        key: `${prefix}.foregroundColor`,
        name: "Foreground Color"
      },
      {
        type: "number",
        key: `${prefix}.width`,
        name: "Width",
        min: 10,
        max: 100
      },
      {
        type: "number",
        key: `${prefix}.rotation`,
        name: "Rotation",
        min: 0,
        max: Math.PI
      }
    ];
  }
}
~~~

## AttributeTree组件结构：

~~~html
<template>
  /*
  		顶层为if - else if - else 的三层并列结构，分别对应数据结构中的"container"、"section和真实数据对象  
    	对于"container"和"section"都递归引用AttributeTree组件，遍历其children数组
  */
  <div v-if="options.type === 'container'">
    <attribute-tree
      v-for="child in options.children"
      :options="child"
      :key="child.key"
      :values="values"
    />
  </div>
  <div v-else-if="options.type === 'section'">
    <span>{{ options.name }}</span>
    <attribute-tree
      v-for="child in options.children"
      :options="child"
      :key="child.key"
      :values="values"
    />
  </div>
  /*
  		对于生成真实功能按钮的feild部分，逻辑基本没变，还是通过options的属性进行生成
    	核心难点就在于对于文本、数值滑块、颜色选择器按钮，v-model如何绑定？
    	因为当前的Walpaper的配置对象分成了text和background两个部分，两个子对象，究竟要绑定哪个子对象的属性？
    	跳转到下面计算属性value
  */
  <feild v-else :name="options.name" :flex="options.type === 'image' ? 'col' : 'row'">
    <el-input
      v-if="options.type === 'text'"
      :placeholder="options.placeholder"
      v-model="value"
    />
    <el-color-picker v-if="options.type === 'color'" v-model="value" />
    <el-slider
      v-if="options.type === 'number'"
      v-model="value"
      :min="options.min"
      :max="options.max"
      :style="{ width: 200 + 'px' }"
    >
    </el-slider>
    <el-upload
      v-if="options.type === 'image'"
      class="upload"
      action=""
      :auto-upload="false"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      :limit="1"
    >
      <el-button size="small" type="primary"> select image </el-button>
    </el-upload>
  </feild>
</template>
~~~

AttributeTree组件—`computed-value`：

首先对于value这个计算属性，不同于以往经常使用的计算属性，默认只设置了get方法，我们也需要给value设置set方法，用于`v-model`对其进行修改。

这里为了能区分绑定的是text对象的属性还是background对象的属性，我们设计的数据结构的每一个生成功能按钮的配置对象的`key`值，都采用了`text.KEY`或者`background.KEY`的格式，我们只要根据`key`字符串`.`之前的字段就可以区分绑定的属性属于哪个对象。我们定义了`get`和`set`方法，使用`reduce`方法对wallpaper配置对象进行“扒皮”，锁定对应属性之后进行读写操作。

~~~js
value: {
  get() {
    const { key } = this.options;
    if (!key) return;
    return get(this.values, key);
  },
  set(newValue) {
    const { key } = this.options;
    if (!key) return;
    set(this.values, key, newValue);
  },
},
~~~

~~~js
/*
	set && get
*/
export function set(obj, key, value) {
  const keys = key.split(".");
  const lastKey = keys.pop();
  /*
  		说白了key值类似于一个路径的记录，例如text.context,就是说wallpaper的顶级配置对象先取text子对象，再访问text子对象的context属性，这也是一种技巧
  		先把key值用split(".")分成数组之后，reduce回调的每一次执行都类似于对顶层对象的"扒皮"，最终锁定到我们要的那个属性（当然set和get的具体实现不同，原理都是这样）
  */
  const o = keys.reduce((o, key) => o[key], obj);
  o[lastKey] = value;
}

export function get(obj, key) {
  const keys = key.split(".");
  return keys.reduce((obj, key) => obj[key], obj);
}
~~~

上面所有的逻辑就是对AttributeTree的重构，我们只要在Editor页面调用`getAttributeOptions`方法获取AttributeTree的配置对象即可：

~~~js
computed: {
  attribute() {
    /*
    	技巧：这里获取text对象的type属性和background对象的type属性运用了解构赋值（获取深层嵌套对象的深层的某个属性的方法）
    */
    const {
      text: { type: textType },
      background: { type: backgroundType },
    } = this.example;
    return getAttributeOptions(textType, backgroundType);
  },
  ...
}
~~~

# 26.深拷贝解决`deep-watch`新旧值相同的问题（wallpaper性能优化）

Wallpaper组件对props接收的配置对象进行深度监视，如果配置对象发生改变，就重新进行渲染（执行`render`），但是由于深度监视可以监视到对象的属性变化，但是如果仅仅是对象的属性值发生改变，而指向对象本身的引用如果没有改变的话，`watch`的回调函数中，新值与旧值相同（都等于新值），**但是如果监听的对象的引用发生改变，那么就会保存旧值与新值**。

所以我们想在对某个对象进行监视的时候获取它变化前的旧值，恰好这个对象是通过`props`接收的对象，那么对应的解决方案：在父组件中写一个计算属性，这个计算属性对想传给子组件的对象进行深拷贝，传给子组件的是深拷贝的结果。这样子组件中`watch`中新旧值为不同引用，旧值就得以保存。

项目中，Editor组件维护着Wallpaper组件的配置对象，并且`AttributeTree`组件生成的功能按钮通过`v-model`与这个对象的属性值进行了绑定，对Wallpaper的配置对象的值进行修改，然后这个配置对象传递给Wallpaper组件用于渲染。我们在Editor组件中给Wallpaper传递配置对象之前对配置对象进行深拷贝，然后传给Wallpaper这个深拷贝的对象，这样每次Editor中对象发生变化，Wallpaper都接收到的是一个新引用对象，然后监听函数：

~~~js
watch: {
  /*
  		options是通过props接收的对象
  */
  options: {
    deep: true,
    handler(oldData, newData) {
      /*
      		我们通过深拷贝的方法保留了oldData，这样就可以比较fontURL和imageURL（普通字符串类型）究竟有没有变化，设置this.fontFace和this.image是否置为undefined从而决定字体或图片需不需要重新加载，达到优化效果
      */
      if (newData.text.fontURL !== oldData.text.fontURL) this.fontFace = undefined;
      if (newData.background.imageURL !== oldData.background.imageURL) this.image = undefined;
      this.render();
    },
  },
      
  ...
  
}
~~~

深拷贝函数`utils/object.js - deepCopy`：

*这个深拷贝只针对项目里深层嵌套对象，且对象属性值为对象或者基本类型的情况。但是写法还是很精彩的。*

~~~js
export function deepCopy(obj) {
  /*
  		递归结束条件：值为普通类型，就直接返回
  */
  if (typeof obj !== "object") return obj;
  /*
  		递归只管当前一层，先用Object.entries把对象的本层转化成数组，数组项为[key,value]
  		reduce的newObj初始值为{},直接给newObj赋值（添加属性）即可
  */
  return Object.entries(obj).reduce(
    /*
    	下面的箭头函数的函数体使用了逗号运算符：
    		括号()里面可以存放若干个js语句，语句之间用","分隔，相当于把多个js操作放到一个语句中，()返回内部最后一个操作的值
    		说白了这里就是不想给箭头函数的函数体使用{}，这样可以省略return，但还想执行两个操作（赋值和返回），所以把两个操作放在()中，并用逗号运算符分隔
    */
    (newObj, [key, value]) => ((newObj[key] = deepCopy(value)), newObj),
    {}
  );
}
~~~

# 27.bug修复：Editor页面且Wallpaper背景为图片时刷新浏览器页面控制台报错

## bug原因：

在Editor页面，data维护了一个写死的example对象作为Wallpaper组件的，默认配置对象，在路由组件激活生命周期activated执行时对会话存储进行读取来更新example对象。Editor页面刷新时，data加载完毕就会把写死的那个默认的example对象传给Wallpaper，然后Editor组件在执行activated回调之后example更新，会再传给Wallpaper组件背景为图片的配置对象，然后这两次对Wallpaper配置对象的传递在Wallpaper内部分别体现在：第一次默认对象被Wallpaper组件的mounted生命周期所使用，调用了render函数，render函数体就两大逻辑，loadAssets加载字体图片以及drawWallpaper绘制canvas。对于Wallpaper接受到的第一个配置对象,我们并没有加载图片资源，而且在执行drawWallpaper函数体的子函数drawBackground时，根据配置对象的type属性决定是否要用图片资源进行绘制，对于这个第一个接收到的配置对象，type为none，根本也不会去执行图片绘制的逻辑。错误的核心就在于传给drawWallpaper函数的配置对象是this.options，但在Wallpaper接收到第一个对象，针对第一个对象的mounted生命周期的render函数绘制执行完之前，Wallpaper又接收到了第二个对象（背景为图片的、Editor组件从会话存储中读到的对象），Wallpaper的this.options发生改变，watch对this.options进行监听，又触发了第二个render函数，这个render函数肯定是正常执行了，不会报错，但错就错在this.options的改变发生在第一个render函数执行drawBackground之前（具体执行顺序没搞太明白，但经过测试确实如此），因为js函数体接受的参数是引用，所以在第一次绘制时执行drawBackground时type值已经成“image”了（因为判断时配置对象已经是接收的第二个了），导致图片资源没加载，但却执行了绘制图片的逻辑。

## 解决方案：

修改Editor页面的data逻辑，在data数据加载时就先获取会话存储，这样就与activated统一起来了，因为传给wallpaper的配置对象该是什么就是什么（不会像更正前默认example一样作为莫名其妙的默认对象传给wallpaper），这样就可以正确渲染了

`Editor - data`：

~~~js
data() {
  /*
  		data中就获取本地存储
  */
  let example = sessionStorage.getItem("wallpaperInfo")
    ? JSON.parse(sessionStorage.getItem("wallpaperInfo"))
    : {
      text: {
        content: "How are you?",
        fontSize: 200,
        fontFamily: "Luckiest Guy",
        fontURL,
        type: "none",
        color: "#532582",
      },
      background: {
        type: "none",
        color: "#fcbc23",
      },
    };
  return {
    example,
  };
},
~~~

# 27.增加ImagePicker组件，Editor组件左侧实现图片展示

说白了我们就是对原本AttributeTree组件中<el-upload>部分进行封装，形成`ImagePicker`组件，组件内部用<img />标签替换原本的<el-button>按钮，自然我们需要传给`ImagePicker`组件图片`url`，并且希望`AttributeTree`组件与`ImagePicker`父子组件之间通过props传递的这个imageURL形成双向数据绑定，如果没有`ImagePicker`这层组件，直接`v-model`就行了，但是给自定义组件使用`v-model`就需要进行配置了。



## 知识点：给自定义组件使用`v-model`：

自定义组件使用`v-model`的基本流程：父组件给子组件通过`v-model`传递过去一个`data`数据，子组件设置一个名为`value`的`props`，这个`value`就会默认接收父组件通过`v-model`传来的数据，然后子组件要想对这个父组件传来的数据进行修改，不能直接修改`value`，毕竟是普通类型的props数据，修改会报错，想要修改为`newValue`时需要执行`this.$emit("input", newValue)`。

上面就是不进行设置时的情况：

* 子组件接收数据的`props`变量为默认`value`
* 子组件对原数据进行修改时，`this.$emit()`指定的事件名默认为`input`

子组件内可以进行配置，修改接收数据的`props`的变量名和修改数据时自定义事件的事件名，配置组件的顶级对象（与data平级）：

~~~js
model: {
    /*
    	子组件接收数据的`props`变量为 "imageURL"
    	子组件对原数据进行修改时，`this.$emit()`指定的事件名为"change"
    */
    prop: "imageURL",
    event: "change",
},
~~~



ImagePicker组件中给<el-upload>中的<img />标签添加样式。



## 知识点：给`element-ui`组件添加自定义样式



其实给element-ui组件添加样式也不是单纯的遵循*标签名就是对应的类名*的规则，正确的方法是利用浏览器自带的开发者工具（非vue），点击想操作的元素，看他有什么class类，而不是一层不变的遵循规则。而且如果给一个element-ui组件添加了一个自定义的样式类之后，在开发者工具中真正的元素嵌套并不一定是组件中我们分析出来的样子，比如我给<el-upload>添加`"image-uploader"`类：<el-upload class="image-uploader">，理论上讲这个类与`.el-upload`类是同一级的，但其实不是，在生成dom结构之后`.el-upload`类的<div>是`.image-uploader`类<div>的子元素。**不是什么规律，不用记，说白了看浏览器开发者工具一目了然**。

**组件内修改element-ui组件的类时不能加`scoped`，不然无效**（不知道原因），但是如果不写`scoped`，修改饿了么组件的样式类会对其它的饿了么组件照成影响，为了防止影响其他组件，所以我们一般会给饿了么组件添加一个自定义类，然后修改饿了么组件的自带类时用后代选择器（两个类之间用空格分隔）对饿了么自带的类进行修改，这样就不会影响其它饿了么组件的样式。

这就是给<el-upload>添加`"image-uploader"`类的原因，我们的目的就是修改饿了么的本身的自带类`.el-upload`，但是为了不影响其它组件，需要一个父类来形成后代选择器。

ImagePicker组件中对`el-upload`类的修改：

~~~css
/*
	不加scoped
*/
<style>
/*
	后代选择器选择.el-upload
*/
.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 150px;
}

...

</style>
~~~

# 28.AttributeTree组件添加修改type的功能

使用<el-select>完成下拉选择功能。

对于文本部分的配置对象数组，第一个和第二个配置对象对应文本内容和字体大小，为各种type都需要的配置。type相关的配置对象之前，我们先放一个生成<el-select>的对象，然后紧跟一个type为children的对象，这个对象的children数组为type相关的配置对象；

AttributeTree的text结构配置对象：

~~~js
[
    /*
    	两个通用配置对象
    */
    {
        type: "text",
        key: "text.content",
        name: "Content",
        placeholder: "Please input title"
    },
    {
        type: "number",
        key: "text.fontSize",
        name: "Font Size",
        min: 10,
        max: 300
    },
   	/*
   		type下拉选择功能相关的配置对象
   	*/
    {
        type: "select",
        key: "text.type",
        name: "Pattern",
        options: [
            { value: "none", label: "None" },
            { value: "line", label: "Line" }
        ],
    },
    /*
    	与type相关的配置对象都放在下面的children数组中
    */
    {
        type: "children",
        children: getTextStyleOptions(type)
    }
];
~~~

对于背景部分的配置对象数组逻辑完全类似，所有功能都与type相关，所以第一个配置对象就是select下拉选择组建的配置对象，然后紧跟children对象，其children数组为背景功能真实的配置对象。

之所以把真实的功能配置对象放在type为children的对象的children数组中，是为了AttributeTree嵌套生成结构时凸显层级关系（实现具体功能的AttributeTree为select下拉选择AttributeTree组件的子组件）

对应AttributeTree组件内添加处理type=children的结构（遍历其children数组）和处理type=select的基本功能结构。

经过上面的修改，Editor页面的左侧AttributeTree组件已经可以正常生成了，而且<el-select>绑定了Wallpaper配置对象的type属性，修改之后Editor页面传给AttributeTree组件的`attribute`配置对象（计算属性）发生改变，自然AttributeTree生成的结构因为type不同发生改变。

## 存留问题：

因为**AttributeTree组件**、**AttributeTree组件数据结构（结构配置对象）**、**Wallpaper配置对象**三者是紧密结合、循环依赖的关系：根据Wallpaper的配置对象（文本和背景两个子对象）的type属性获取AttributeTree组件的配置对象，然后AttributeTree组件根据配置对象生成对应的结构，并且这些结构按钮通过`v-model`绑定了Wallpaper配置对象。统一三者循环关系的一个变量就是Wallpaper配置对象中的type属性（对文本配置取值有："none"、"line"；对背景配置："none"、"image"、"line"）。

经过上面的更新，我们的AttributeTree生成的结构具备了修改Wallpaper配置对象的type的功能，相关的AttributeTree的结构对象也准备好了，但是目前的问题：我们在修改Wallpaper的type之后，生成的结构可能并没有正确绑定Wallpaper的配置对象，因为我们只是修改了Wallpaper配置对象的一个属性值，而没有修改Wallpaper的其它属性，比如type从"none"更改成"line"之后，Wallpaper配置对象虽然type为"line"却根本没有`rotation`属性，其他属性还是"none"时的属性，**所以目前的问题就是更改Wallpaper配置对象的type之后如何去修改一整个Wallpaper配置对象成为与type匹配的配置对象**。

# 29.修改Wallpaper的配置对象的type属性时更新type相关的其他属性（28存留问题解决）

解决思路：给select下拉选择的结构配置对象增加属性用来存储 各种type对应的、需要给Wallpaper配置对象增加的、属性。

background的select下拉选择的结构配置对象：

~~~js
{
  type: "select",
  key: "background.type",
  name: "Pattern",
  options: [
    { value: "none", label: "None" },
    { value: "image", label: "Image" },
    { value: "line", label: "Line" }
  ],
  /*
  		新增relations数组，trigger代表type的类型，actions数值存放trigger类型需要（给Wallpaper配置对象）新增的属性
  */
  relations: [
    {
      trigger: "none",
      /*
      		对于普通的"none"类型，只需要增加（设置）一个color属性
      */
      actions: [
        {
          key: "background.color",
          value: "#000000"
        }
      ]
    },
    {
      trigger: "image",
      actions: [
        {
          key: "background.imageURL",
          value: "https://i.loli.net/2021/09/04/drBtUVNhlq87Rwc.jpg"
        }
      ]
    },
    ...getPatternRelations("background")
  ]
},
~~~

修改`AttributeTree`组件的`value`计算属性以利用新增的`relations`数据：

~~~js
computed: {
  value: {
    get() {
      const { key } = this.options;
      if (!key) return;
      return get(this.values, key);
    },
    set(newValue) {
      /*
      		获取结构配置对象中的relations数组，利用set方法把他们添加到Wallpaper配置对象（this.values）身上
      		只有select下拉选择的结构对象有relations数组，其它组件默认给一个空数组[]
      */
      const { key, relations = [] } = this.options;
      if (!key) return;
      
      set(this.values, key, newValue);

      for (const { trigger, actions } of relations) {
        /*
        	trigger用来匹配新的type
        */
        if (trigger === newValue) {
          /*
          	遍历属性列表
          */
          for (const { key, value } of actions) {
            const oldValue = get(this.values, key);
            /*
            	属性列表中的属性不是无脑添加与设置，只有以前没有这个属性（oldValue === undefined）才添加并设置（set）
            */
            if (oldValue === undefined) {
              set(this.values, key, value);
            }
          }
        }
      }
    },
  },
},
~~~

经过上面的修改会发现：background部分通过下拉框选择了新的type之后，新type的初始状态可以正常显式，但是通过下面的功能按钮修改属性时无效，原因：**我们通过set方法给Wallpaper配置对象手动添加的新属性并不是响应式的属性**，这些属性虽然存在于Wallpaper配置对象上了，但是它们的修改并不会被监听到，视图也不会进行更新。

修改`@/utils/object.js - set`：

~~~js
import Vue from "vue";

export function set(obj, key, value) {
  const keys = key.split(".");
  const lastKey = keys.pop();
  const o = keys.reduce((o, key) => o[key], obj);
	
  /*
  		使用Vue.set(obj, key, value)，为某个响应式对象（组件的数据）obj添加响应式属性
  */
  // o[lastKey] = value;
  Vue.set(o, lastKey, value);
}
~~~

这样背景部分的功能就全部正常了。

文字部分的逻辑完全类似，给AttributeTree的select结构对象增加`relations`数组即可。

# 项目总结

## 开发过程

### 1.导航栏路由配置

使用element-ui的基操：安装，main.js里引入总样式，按需引入组件并`Vue.use`，导航栏<el-meun>使用路由模式<el-menu :router="true">

### 2.初期Wallpaper选择一个<p>

然后`:style="{}"`添加字体颜色等样式，加载字体在App.vue里使用`@font-face`使用字体文件（后期选择<canvas>代替<p>既是为了扩展绘制模式，也可完成下载功能）

### 3.定义两个混入：维护屏幕大小属性 && 维护鼠标滚轮滚动程度

混入的定义方式：data配置之后，`mounted`中：`window.addEventListener("mousewheel" / "resize",() => {更新数据}`

其中useWindowScroll传入参数minY与maxY，使用约束函数（`constrain`，任意两者取大再与剩者取小）进行范围控制

### 4.Home组件和Editor组件进行缓存

（ <keep-alive include="数组">包裹<router-view> ）

### 5.<p>初换<canvas>，首次绘制字体加载失败的问题

`@font-face`异步动态加载（使用时才加载）所致，使用字体对象`Fontface`，绘制canvas之前执行`await new FontFace().load()`即可。

### 6.绘制模式的逻辑分解，绘制功能的横向拓展

初始增加绘制模式时通过mode属性进行绘制模式的区分，一个mode对应一整个大模式，后来逐渐改进Wallpaper配置对象，进行绘制逻辑的解耦。

### 7.初始新增pattern绘制模式

说白了就是封装`containerContext.createPattern(canvas, "repeat");`方法构造`fillStyle`，然后再填充（绘制）canvas。

`line`方法在临时构造的canvas上画线条，然后用这个canvas去构造`fillStyle`（`createPattern(canvas, "repeat")`），旋转效果是最后对newPattern进行矩阵变化得到的。（`pattern.setTransform(matrix);`）

构造`matrix`旋转矩阵时除了旋转角度一个参数，还需要一个与canvas优化相关的参数：构造`fillStyle`时创建的canvas的上下文也是经过canvas画质优化方法创建的，所以最后那一句`scale(2, 2)`会导致创建出来的`fillStyle`比较稀疏（比较于没有执行`scale`的canvas，绘制的图案密度小），所以我们在创建`matrix`变化矩阵时，把`a b c d`四个canvas参数全部缩小，这就可相当于抵消了`scale`，使得绘制的东西（线条）重新变得更加紧密一点。（如果canvas画质优化时canvas密度扩大的太多，会导致线条非常稀疏）

### 8.canvas画质优化

canvas的width和height设置为2倍（这个2可以根据window对象pixelRatio属性、设备像素比来决定，但效果没有2好），然后通过style设置width和height为原本大小，最后执行`scale(2, 2)`让绘制坐标与视觉统一。

### 9.绘制图片前加载资源

对于有加载完毕生命周期回调的图片资源，直接`await new Promise()`

Promise执行器中在资源加载完毕生命周期中调用`resolve(资源)`

~~~js
async loadImage() {
  this.image = await new Promise((resolve)=>{
    const newImage = new Image();
    newImage.src = this.options.imageURL;
    newImage.onload = function() {
      resolve(newImage);
    }
  })
}
~~~

### 10.图片不拉伸裁剪算法

确定裁剪大小：

知道图片的宽高比和canvas的宽高比，如果canvas比较扁，图片放大后（放大理解法），所以裁剪图片时宽度完全保留，高度根据canvas的宽高比和裁剪宽度决定。如果canvas比较高，图片裁剪后高度完全保留，宽度由canvas宽高比与裁剪高度决定。

计算裁剪位置：

裁剪到的图片永远是原图的一部分（裁剪图<=原图），无脑原图减裁剪图除二就是裁剪位置。

### 11.Screen组件添加边框

`borderImage`结合`borderImageSlice`属性切图，但是需要考虑页面缩放时边框大小合理（canvas大小适配于windowWidth，然后设置`borderWidth`与canvas大小保持一个固定比例即可）

### 12.canvas缩放抖动bug（bug修复与性能优化）

经过代码排查，是因为每次缩放时重新加载字体或者图片耗时太大，scale缩放先执行，后面渲染执行，原本一瞬间的绘制出现了间隔。

data中配置fontFace和image变量保存记录当前Wallpaper对字体与图片资源的加载情况，每次重新加载字体或图片之前，判断只有data中资源没有加载完成（根据字体对象或者图片对象的属性判断）才进行新的加载，所以对Wallpaper配置对象进行深度监听，在传入的字体地址或者图片地址改变时设置组件内`this.fontFace`和`this.image`为`undefined`，这里引出一个新问题：vue深度监听某个对象时能监听到对象属性值的变化，但是回调函数接收的新值与旧值相同，所以采取配置对象深拷贝之后传给Wallpaper。

深拷贝纯嵌套对象（无数组）：

~~~js
export function deepCopy(obj) {
  if (typeof obj !== "object") return obj;
  return Object.entries(obj).reduce(
    (newObj, [key, value]) => ((newObj[key] = deepCopy(value)), newObj),
    {}
  );
}
~~~

### 13.组件封装：定位缩放组件Scale变定位功能为可选功能

通过props接收的布尔值，结合:style的数组形式：`:style="[bool&&{}]"`——布尔值控制样式集合对象是否存在

~~~html
<div
:style="[
    fixed && {
    position: 'absolute',
    left: transformed.x + 'px',
    top: transformed.y + 'px',
    zIndex,
    },
    {
    transformOrigin: 'left top',
    transform: `scale(${transformed.scale}, ${transformed.scale})`,
    width: transformed.width + 'px',
    height: transformed.height + 'px',
    },
    styles,
]"
>
<slot />
</div>
~~~

### 14.修改element-ui的默认样式时防止全局样式污染问题

可以给想修改样式的element组件添加一个父<div>，通过子代选择器选中父<div>下的element组件，其实也可以直接给element组件添加自定义类，在浏览器开发者工具中可以看到我们添加的自定义类与element组件的类究竟什么关系。然后根据css选择器选中这一个element组件。

### 15.Home页面转Editor页面Wallpaper预览

Home页面点击轮播图中的Wallpaper转跳Editor页面之前对Wallpaper配置对象进行本地会话存储`sessionStorage.setItem`，然后因为Editor组件是被缓存的路由组件，所以要把读取本地会话存储的逻辑放在`activated`生命周期中，在`deactivated`中清除会话存储`sessionStorage.removeItem`。

此时要修改`data`中的逻辑，也读取本地会话存储，不然：

当前Editor背景为图片，刷新浏览器，Editor页面先加载data，然后Wallpaper配置对象是普通的默认对象，随之deactivatd更改了Wallpaper配置对象成为了图片类型，**推测异步函数会在data与deactivated执行之后执行，导致mounted生命周期中执行render渲染时并没有加载图片资源，但是此时配置对象已经成为图片类型，然后按照图片类型进行绘制，导致报错**

总而言之，activated中修改data数据的操作（读取本地存储），需要在data中也执行。

### 16.Editor页面Wallpaper预览适配算法

核心逻辑就是让Wallpaper能在<el-main>中能放的开，算出el-main中留出来的大小，Wallpaper与window宽高等比，根据宽或者高中缩小比例比较大的进行缩小，根据缩小比例算出translateX Y。

### 17.图片上传功能

利用没有action属性的<el-upload>标签（不使用其上传功能）获取文件对象，然后用`FileReader`对象处理文件对象：

~~~js
handleChange(file) { //这是<el-upload>事件的回调函数
  /*
  	回调的核心逻辑就是对图片类型的文件对象的处理：使用FileReader对象
  	并且完成对values（wallpaper配置对象）的修改
  */
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = (event) => {
    console.log(event);
    const imageURL = event.target.result;
    this.values.imageURL = imageURL;
  };
},
~~~

### 18.AttributeTree组件

递归组件，接收两个对象，结构对象和value对象，根据数据结构递归遍历生成相应的结构，相应的按钮绑定value对象的属性值。

对应的结构对象：

四层嵌套对象，由外至内对象的type属性为container、section（文本与背景）、children（<el-select>下拉框下面）、真实结构对象。

<el-select>绑定value对象的type属性值，在Editor对象中，type一改，相关的结构对象就会修改，自然生成不同的结构。

（修改type生成的children部分的结构）  还需要绑定value对象的属性值，必要时给value对象添加新的属性，这里就需要AttributeTree组件的计算属性value，使用set、get模式定义

添加属性新属性逻辑：只有<el-select>对象有relations数组，每次set  value时获取relations，如果有就根据relations的内容进行添加，添加新属性需要`Vue.set`（响应式数据）

