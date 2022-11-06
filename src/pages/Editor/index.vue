<template>
  <el-container class="container">
    <el-aside width="300px">
      <attribute-tree :options="attribute" :values="example" />
    </el-aside>
    <el-container>
      <div
        :style="{
          transform: `translate(${transformed.translateX}px, ${transformed.translateY}px) scale(${transformed.scale}, ${transformed.scale})`,
          transformOrigin: 'left top',
        }"
      >
        <wallpaper
          :options="example"
          :width="windowWidth"
          :height="windowHeight"
        />
      </div>
    </el-container>
  </el-container>
</template>

<script>
import Wallpaper from "@/components/Wallpaper";
import AttributeTree from "@/components/AttributeTree/index.vue";
import { useWindowSize } from "@/mixins/useWindowSize";
import fontURL from "@/assets/font/LuckiestGuy.woff2";
import { getAttributeOptions } from "@/utils/attribute";
export default {
  name: "Editor",
  data() {
    return {
      example: {
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
    };
  },
  mixins: [useWindowSize()],
  components: {
    Wallpaper,
    AttributeTree,
  },
  activated() {
    this.example = sessionStorage.getItem("wallpaperInfo")
      ? JSON.parse(sessionStorage.getItem("wallpaperInfo"))
      : this.example;
  },
  deactivated() {
    sessionStorage.removeItem("wallpaperInfo");
  },
  computed: {
    transformed() {
      const padding = 50;
      const mainHeight = this.windowHeight - 61;
      const mainWidth = this.windowWidth - 300;
      const width = mainWidth - padding * 2;
      const height = mainHeight - padding * 2;
      const sh = height / this.windowHeight;
      const sw = width / this.windowWidth;
      const scale = Math.min(sh, sw);
      const translateX = (mainWidth - this.windowWidth * scale) / 2;
      const translateY = (mainHeight - this.windowHeight * scale) / 2;
      return {
        scale,
        translateX,
        translateY,
      };
    },
    attribute() {
      const {
        text: { type: textType },
        background: { type: backgroundType },
      } = this.example;
      return getAttributeOptions(textType, backgroundType);
    },
  },
};
</script>

<style scoped>
.container {
  height: calc(100vh - 61px);
}

.el-footer {
  background-color: #b3c0d1;
}

.el-aside {
  background-color: #d3dce6;
}

.el-container {
  background-color: #e9eef3;
  overflow: hidden;
  padding: 0px;
}
</style>