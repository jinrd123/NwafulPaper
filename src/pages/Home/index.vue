<template>
  <div>
    <h1>Home</h1>
    <scale :from="dimension.from" :to="dimension.to" :progress="progress">
      <screen>
        <wallpaper
          :options="example"
          :width="dimension.from.width"
          :height="dimension.from.height"
          :mode="mode"
        />
      </screen>
    </scale>
  </div>
</template>

<script>
import Wallpaper from "@/components/Wallpaper";
import Scale from "@/components/Scale";
import Screen from "@/components/Screen";
import { useWindowScroll } from "@/mixins/useWindowScroll";
import { useWindowSize } from "@/mixins/useWindowSize";
import { map } from "@/utils/math";
import fontURL from "@/assets/font/LuckiestGuy.woff2";
const [MIN_Y, MAX_Y] = [0, 200];
export default {
  name: "Home",
  mixins: [useWindowScroll(MIN_Y, MAX_Y), useWindowSize()],
  data() {
    return {
      mode: "image",
    };
  },
  components: {
    Wallpaper,
    Scale,
    Screen,
  },
  computed: {
    progress: function () {
      return map(this.scrollY, MIN_Y, MAX_Y, 0, 1);
    },
    dimension() {
      const scale = 0.5;
      return {
        from: {
          x: 0,
          y: 0,
          width: this.windowWidth,
          height: this.windowHeight,
        },
        to: {
          width: this.windowWidth * scale,
          height: this.windowHeight * scale,
          x: (this.windowWidth * (1 - scale)) / 2,
          y: this.windowHeight - 100 - this.windowHeight * scale,
        },
      };
    },
    example() {
      const options = {
        title: "How are you?",
        fontSize: 230,
        fontFamily: "Luckiest Guy",
        fontURL,
      };
      if (this.mode === "color") {
        return {
          ...options,
          background: "#132743",
          text: "#d7385e",
        };
      } else if (this.mode === "pattern") {
        return {
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
          },
        };
      } else {
        return {
          ...options,
          imageURL: "https://i.loli.net/2021/09/04/drBtUVNhlq87Rwc.jpg",
          text: "#fff",
        };
      }
    },
  },
};
</script>

<style>
</style>