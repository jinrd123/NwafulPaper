<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { drawWallpaper } from "@/utils/wallpaper";
import { loadImage, loadFont } from "@/utils/load";
import { Message } from "element-ui";

export default {
  name: "Wallpaper",
  data() {
    return {
      fontFace: undefined,
      image: undefined,
    };
  },
  props: {
    options: Object,
    width: Number,
    height: Number,
  },
  mounted() {
    this.render();
  },
  methods: {
    async render() {
      await this.loadAssets();
      if (this.image) this.options.background.image = this.image;
      drawWallpaper(this.$refs.canvas, this.width, this.height, this.options);
    },
    async loadAssets() {
      try {
        const { fontURL, fontFamily } = this.options.text;
        const { imageURL } = this.options.background;
        const shouldLoadFont = fontURL && (!this.fontFace || !this.fontFace.loaded);
        const shouldLoadImage = imageURL && !this.image;
        if (!shouldLoadFont && !shouldLoadImage) return;
        this.fontFace = shouldLoadFont ? await loadFont(fontURL, fontFamily) : this.fontFace;
        this.image = shouldLoadImage ? await loadImage(imageURL) : this.image;
      } catch (e) {
        Message.error("Failed to load assets!");
      }
    },
  },
  watch: {
    options: {
      deep: true,
      handler(oldData, newData) {
        if (newData.text.fontURL !== oldData.text.fontURL) this.fontFace = undefined;
        this.image = undefined;
        this.render();
      },
    },
    width() {
      this.render();
    },
    height() {
      this.render();
    },
  },
};
</script>

<style>
</style>