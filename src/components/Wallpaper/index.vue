<template>
  <div class="cantainer">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { drawColorWords } from "@/utils/canvas.js";
export default {
  name: "Wallpaper",
  props: {
    data: {
      title: String,
      bgColor: String,
      fontSize: Number,
      fontFamily: String,
      textColor: String,
    },
    width: Number,
    height: Number,
  },
  mounted() {
    this.render();
  },
  methods: {
    render() {
      drawColorWords(this.$refs.canvas, this.width, this.height, this.data);
    },
  },
  watch: {
    data: {
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