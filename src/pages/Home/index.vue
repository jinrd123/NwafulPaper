<template>
  <div>
    <h1>Home</h1>
    <div class="wallpaper"><wallpaper :data="wallpaper" /></div>
  </div>
</template>

<script>
import Wallpaper from "@/components/Wallpaper";
export default {
  data() {
    return {
      wallpaper: {
        title: "ggg",
        bgColor: "#132743",
        textColor: "#d7385e",
        fontSize: 200,
        fontFamily: "庞门正道粗书体",
      },
    };
  },
  components: {
    Wallpaper,
  },
};
</script>

<style>

</style>