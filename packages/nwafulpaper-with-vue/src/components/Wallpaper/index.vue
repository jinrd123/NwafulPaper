<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { drawWallpaper } from "rd666-draw-utils/lib/wallpaper";
import { loadImage, loadFont } from "rd666-draw-utils/lib/load";
import { Message } from "element-ui";

export default {
  name: "Wallpaper",
  data() {
    return {
      fontFace: undefined,
      image: undefined,
      rendering: false,
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
      if (this.rendering) return;
      this.rendering = true;

      await this.loadAssets();
      if (this.image) this.options.background.image = this.image;
      drawWallpaper(this.$refs.canvas, this.width, this.height, this.options);

      this.rendering = false;
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
        if (newData.background.imageURL !== oldData.background.imageURL) this.image = undefined;
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