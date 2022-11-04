<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import {
  drawColorWords,
  drawPatternWords,
  drawImageWords,
} from "@/utils/words";

export default {
  name: "Wallpaper",
  data() {
    return {
      fontFace: undefined,
      image: undefined,
    };
  },
  props: {
    options: {
      title: String,
      background: [String, Object],
      fontSize: Number,
      fontFamily: {
        type: String,
        default: "Luckiest Guy",
      },
      text: [String, Object],
      fontURL: String,
      imageURL: String,
    },
    width: Number,
    height: Number,
    mode: String,
  },
  mounted() {
    this.render();
  },
  methods: {
    async render() {
      await this.loadFont();
      switch (this.mode) {
        case "color":
          drawColorWords(
            this.$refs.canvas,
            this.width,
            this.height,
            this.options
          );
          break;
        case "pattern":
          drawPatternWords(
            this.$refs.canvas,
            this.width,
            this.height,
            this.options
          );
          break;
        case "image":
          await this.loadImage();
          drawImageWords(this.$refs.canvas, this.width, this.height, {
            ...this.options,
            image: this.image,
          });
          break;
      }
    },
    async loadFont() {
      if (this.fontFace && this.fontFace.loaded) {
        return;
      } else {
        this.fontFace = await new FontFace(
          this.options.fontFamily,
          `url(${this.options.fontURL})`
        ).load();
      }
    },
    async loadImage() {
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
  },
  watch: {
    options: {
      deep: true,
      handler(oldData, newData) {
        if (newData.fontURL !== oldData.fontURL) this.fontFace = undefined;
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