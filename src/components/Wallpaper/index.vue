<template>
  <div class="cantainer">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { drawColorWords, drawPatternWords } from "@/utils/canvas.js";
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
      background: [String, Object],
      fontSize: Number,
      fontFamily: {
        type: String,
        default: "Luckiest Guy"
      },
      text: [String, Object],
      fontURL: String,
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
          drawColorWords(this.$refs.canvas, this.width, this.height, this.options);
          break;
        case "pattern":
          drawPatternWords(this.$refs.canvas, this.width, this.height, this.options);
          break;
      }
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