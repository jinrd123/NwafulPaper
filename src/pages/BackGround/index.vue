<template>
  <div id="con">
    <section>
      <img :src="starsURL" :style="{ left: scrollY * 0.25 + 'px' }" />
      <img :src="moonURL" id="moon" :style="{ top: scrollY * 1.05 + 'px' }" />
      <img :src="mountainsBehindURL" id="mountains_behind" :style="{ top: scrollY * 0.5 + 'px' }" />
      <h2
        ref="text"
        id="text"
        :style="{ marginRight: scrollY * 4 + 'px', marginTop: scrollY * 1.5 + 'px' }"
      >
        Study Forever
      </h2>
      <a href="#sec" id="btn" :style="{ marginTop: scrollY * 1.5 + 'px' }">Explore</a>
      <img :src="mountainsFrontURL" id="mountains_front" />
    </section>
    <div class="sec" id="sec">
      <h2>I do not want to lose control</h2>
      <p>Early in the morning I still get a little bit nervous</p>
      <p>清晨时分，我仍旧难以轻松地醒来</p>
      <p>Fighting my anxiety constantly I try to control it</p>

      <p>永远都在与焦虑不安斗争，我不想被轻易击垮</p>
      <p>Even when I know it’s been forever I can still feel the spin</p>
      <p>尽管我明白这就是我的宿命，可我还相信反击的可能</p>
      <p>Hurts when I remember and I never wanna feel it again</p>
      <p>每次回忆都是刺痛的伤害，而我不想再任它折磨</p>
      <p>Don’t know if you get it cause I can’t express how thankful I am</p>
      <p>如果你能明白我的处境，你也会明白我，对你满心无以言表的感激</p>
      <p>That you were always with me when it hurts I know that you understand</p>
      <p>曾伴我走过每一场风雨，我想这次你能够理解</p>
      <p>I don’t wanna lose control</p>
      <p>我不愿失控沦陷</p>
      <p>Nothing I can do anymore</p>
      <p>无力以抗争世界</p>
      <p>Trying every day when I hold my breath</p>
      <p>屏住呼吸，每一天都竭尽全力</p>
      <p>Spinning out in space pressing on my chest</p>
      <p>承受着挤压胸膛的重负，我在夹缝中生存</p>
      <p>I don’t wanna lose control</p>
      <p>可我不想全然失控</p>
      <p>Sometimes I still think it’s coming but I know it’s not</p>
      <p>有时我脑海里闪过放弃的念头，可我没有轻易妥协</p>
      <p>Trying to breathe in and then out but the air gets caught</p>
      <p>尽力地吸气，哪怕又要呼出，可我已捕获到了维持生命的氧气</p>
      <p>Cause even though I’m older now and I know how to shake off the past</p>
      <p>因为尽管年岁在堆积，我也依旧能甩去嵌在心底处，对过去的执念</p>
      <p>I wouldn’t have made it if I didn’t have you holding my hand</p>
      <p>我难以挺过这些困苦，如若没有你握紧我的手</p>
      <p>I don’t wanna lose control</p>
      <p>我不愿失控沦陷</p>
      <p>Nothing I can do anymore</p>
      <p>无力以抗争世界</p>
      <p>Trying every day when I hold my breath</p>
      <p>屏住呼吸，每一天都竭尽全力</p>
      <p>Spinning out in space pressing on my chest</p>
      <p>承受着挤压胸膛的重负，我在夹缝中生存</p>
      <p>I don’t wanna lose control</p>
      <p>可我不想全然失控</p>
      <p>I need you to know I would never be this strong without you</p>
      <p>我想让你明白吗，没有你的支持，我难以如此坚强</p>
      <p>You’ve seen how I’ve grown you took all my doubt</p>
      <p>见证了我成长的每一步，你是我完全信任的依靠</p>
      <p>Cause you were home</p>
      <p>因为你是我的归宿</p>
      <p>I don’t wanna lose control</p>
      <p>我不愿失控沦陷</p>
      <p>There’s nothing I can do anymore</p>
      <p>无力以抗争世界</p>
      <p>I don’t wanna lose control</p>
      <p>我不愿凌乱崩溃</p>
      <p>Nothing I can do anymore (anymore), anymore</p>
      <p>无能为力至泣泪</p>
      <p>Trying every day when I hold my breath</p>
      <p>屏住呼吸，每一天都竭尽全力</p>
      <p>Spinning out in space pressing on my chest</p>
      <p>承受着挤压胸膛的重负，我在夹缝中生存</p>
      <p>I don’t wanna lose control</p>
      <p>可我不想全然失控</p>
    </div>
  </div>
</template>

<script>
import moonURL from "@/assets/images/moon.png";
import mountainsBehindURL from "@/assets/images/mountains_behind.png";
import starsURL from "@/assets/images/stars.png";
import mountainsFrontURL from "@/assets/images/mountains_front.png";
export default {
  name: "BackGround",
  data() {
    return {
      starsURL,
      mountainsBehindURL,
      mountainsFrontURL,
      moonURL,
      scrollY: 0,
    };
  },
  /**笔记一下，箭头函数才行 */
  mounted() {
    window.addEventListener("scroll", () => {
      this.scrollY = window.scrollY;
    });
  },
  activated() {
    document.body.style.overflow = "visible";
  },
  deactivated() {
    document.body.style.overflow = "hidden";
  },
};
</script>

<style scoped>
/* 这是引入了一些字体 */
@import url("https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700,800,900&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
  /* 当用户手动导航或者 CSSOM scrolling API 触发滚动操作时 */
  scroll-behavior: smooth;
}

#con {
  /* min-height: calc(100vh - 61px); */
  overflow-x: hidden;
  background: linear-gradient(#2b1055, #7597de);
}

section {
  position: relative;
  width: 100%;
  height: calc(100vh - 61px);
  padding: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

section::before {
  content: "";
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(to top, #1c0522, transparent);
  z-index: 1000;
}

section img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* object-fit CSS 属性指定可替换元素（例如：<img> 或 <video>）的内容应该如何适应到其使用高度和宽度确定的框。 */
  object-fit: cover;
  pointer-events: none;
}
section img#moon {
  /* mix-blend-mode CSS 属性描述了元素的内容应该与元素的直系父元素的内容和元素的背景如何混合。 */
  mix-blend-mode: screen;
}

section img#mountains_front {
  z-index: 10;
}

#text {
  position: absolute;
  right: -350px;
  color: #fff;
  white-space: nowrap;
  font-size: 7.5vw;
  z-index: 9;
}

#btn {
  position: absolute;
  text-decoration: none;
  display: inline-block;
  padding: 8px 30px;
  border-radius: 40px;
  background: #fff;
  color: #2b1055;
  font-size: 1.5em;
  z-index: 9;
  transform: translateY(100px);
}
.sec {
  position: relative;
  padding: 100px;
  background: #1c0522;
}

.sec h2 {
  font-size: 3.5em;
  margin-bottom: 10px;
  color: #fff;
}

.sec p {
  font-size: 1em;
  color: #fff;
}
</style>