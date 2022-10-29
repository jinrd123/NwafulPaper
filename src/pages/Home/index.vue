<template>
  <div>
    <h1>Home</h1>
    <div
      class="example"
      :style="{
        left: transformed.x + 'px',
        top: transformed.y + 'px',
        transform: `scale(${transformed.scale}, ${transformed.scale})`,
        transformOrigin: 'left top',
      }"
    >
      <screen
        :src="screenURL"
        :meta="screenMeta"
        :width="transformed.width"
        :height="transformed.height"
      >
        <wallpaper
          :options="example"
          :width="transformed.width"
          :height="transformed.height"
          :mode="mode"
        />
      </screen>
    </div>
  </div>
</template>

<script>
import Wallpaper from "@/components/Wallpaper";
import Screen from "@/components/Screen";
import { useWindowScroll } from "@/mixins/useWindowScroll";
import { useWindowSize } from "@/mixins/useWindowSize";
import { map } from "@/utils/math";
import fontURL from "@/assets/font/LuckiestGuy.woff2";
import screenURL from "@/assets/images/mac.png";
const [MIN_Y, MAX_Y] = [0, 200];
export default {
  name: "Home",
  mixins: [useWindowScroll(MIN_Y, MAX_Y), useWindowSize()],
  data() {
    return {
      mode: "image",
      screenURL,
      screenMeta: {
        left: 145,
        right: 145,
        top: 45,
        bottom: 85,
        width: 1211,
        height: 707,
      },
    };
  },
  components: {
    Wallpaper,
    Screen,
  },
  computed: {
    progress: function () {
      return map(this.scrollY, MIN_Y, MAX_Y, 0, 1);
    },
    dimension() {
      const scale = 0.5;
      const bottom = 150;
      const macAspect = 0.625;
      return {
        from: {
          x: 0,
          y: 0,
          width: this.windowWidth,
          height: this.windowHeight,
          scale: 1,
        },
        to: {
          width: this.windowWidth,
          height: this.windowWidth * macAspect,
          x: (this.windowWidth * (1 - scale)) / 2,
          y: this.windowHeight - this.windowWidth * macAspect * scale - bottom,
          scale,
        },
      };
    },
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
    example() {
      const options = {
        title: "How are you?",
        fontSize: 200,
        fontFamily: "Luckiest Guy",
        fontURL,
      };
      const modeOptions = {
        color: {
          ...options,
          background: "#fcbc23",
          text: "#532582",
        },
        pattern: {
          ...options,
          background: {
            backgroundColor: "white",
            patternColor: "#ddd",
            type: "line",
          },
          text: {
            backgroundColor: "#89E089",
            patternColor: "currentColor",
            type: "line",
            rotation: -45,
            width: 25,
            height: 25,
          },
        },
        image: {
          ...options,
          imageURL: "https://i.loli.net/2021/09/04/drBtUVNhlq87Rwc.jpg",
          text: "#fff",
        },
      };
      return modeOptions[this.mode];
    },
  },
};
</script>

<style>
.example {
  position: absolute;
  z-index: 10;
}
</style>