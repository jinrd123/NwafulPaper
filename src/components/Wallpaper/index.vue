<template>
  <div class="cantainer">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { drawColorWords } from "@/utils/canvas.js";
export default {
  name: "Wallpaper",
  data() {
    return {
      fontFace: undefined,
    }
  },
  props: {
    options: {
      title: String,
      bgColor: String,
      fontSize: Number,
      fontFamily: String,
      textColor: String,
      fontURL: String,
    },
    width: Number,
    height: Number,
  },
  mounted() {
    this.render();
  },
  methods: {
    async render() {
      await this.loadFont();
      drawColorWords(this.$refs.canvas, this.width, this.height, this.options);
    },
    async loadFont() {
      this.fontFace = await new FontFace(this.options.fontFamily, `url(${this.options.fontURL})`).load();
    },
  },
  watch: {
    options: {
      deep: true,
      handler() {
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
.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>