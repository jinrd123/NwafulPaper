<template>
  <div>
    <div class="top-container">
      <div class="top">
        <h1>Carpe Diem</h1>
        <p>
          Use words mixed with colors, patterns and images to communicate with
          your wallpaper. 🍉
        </p>
        <el-button type="primary" @click="handleStarted">Get Started</el-button>
        <el-button type="success" @click="handleExplore">Explore</el-button>
      </div>
    </div>
    <scale
      :from="dimension.from"
      :to="dimension.to"
      :fixed="true"
      :progress="progress"
      @onResize="handleResize"
    >
      <screen
        :src="screenURL"
        :meta="screenMeta"
        :width="screenSize.width"
        :height="screenSize.height"
      >
        <el-carousel :height="screenSize.height + 'px'">
          <el-carousel-item v-for="example in examples" :key="example.mode">
            <div
              @click="handleSelectExample(example)"
              :style="{
                cursor: progress >= 1 ? 'pointer' : 'default',
              }"
            >
              <wallpaper
                :options="example"
                :width="screenSize.width"
                :height="screenSize.height"
                :mode="example.mode"
              />
            </div>
          </el-carousel-item>
        </el-carousel>
      </screen>
    </scale>
  </div>
</template>

<script>
import Wallpaper from "@/components/Wallpaper";
import Screen from "@/components/Screen";
import { useWindowScroll } from "@/mixins/useWindowScroll";
import { useWindowSize } from "@/mixins/useWindowSize";
import { map } from "rd666-draw-utils/lib/math";
import fontURL from "@/assets/font/LuckiestGuy.woff2";
import screenURL from "@/assets/images/mac.png";
import Scale from "@/components/Scale";
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
      examples: [
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
            foregroundColor: "#000",
            color: "#89E089",
          },
          background: {
            color: "#fff",
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
      screenSize: {
        width: 0,
        height: 0,
      },
    };
  },
  components: {
    Wallpaper,
    Screen,
    Scale,
  },
  computed: {
    progress: function () {
      return map(this.scrollY, MIN_Y, MAX_Y, 0, 1);
    },
    dimension() {
      const bottom = 100;
      const macAspect = 0.625;
      const toHeight =
        ((this.windowHeight * 0.7 - 61) * (707 - 45 - 85)) / 707 - bottom / 2;
      const scale = toHeight / (this.windowWidth * macAspect);
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
  },
  methods: {
    handleResize({ width, height }) {
      this.screenSize = { width, height };
    },
    handleStarted() {
      this.$router.push({ path: "editor" });
    },
    handleExplore() {
      this.$router.push({ path: "background" });
    },
    handleSelectExample(example) {
      if (this.progress < 1) return;
      sessionStorage.setItem("wallpaperInfo", JSON.stringify(example));
      this.$router.push({ path: "editor" });
    },
  },
};
</script>

<style>
.top-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 33.3vh;
}
.top > h1 {
  margin: 0.2em;
  font-weight: bold;
  font-size: 50px;
}

.top > p {
  font-size: 20px;
  margin-bottom: 1em;
}
</style>