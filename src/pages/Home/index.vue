<template>
  <div>
    <h1>Home</h1>
    <scale
      v-for="example in examples"
      :key="example.type"
      :data="example.scale"
    >
      <screen :type="examples.type">
        <wallpaper :data="example.data" />
      </screen>
    </scale>
  </div>
</template>

<script>
import Wallpaper from "@/components/Wallpaper";
import Scale from "@/components/Scale";
import Screen from "@/components/Screen";
export default {
  name: 'Home',
  data() {
    return {
      examples: [
        {
          type: "mac",
          data: {
            title: "How are you?",
            bgColor: "#132743",
            textColor: "#d7385e",
            fontSize: 280,
            fontFamily: "Luckiest Guy",
          },
          scale: {
            progress: 0.9,
            domain: [0, 1],
            range: {
              width: ["0%", "100%"],
              height: ["0%", "100%"],
              x: ["0%", "0%"],
              y: ["0%", "0%"],
            },
          },
        },
      ],
    };
  },
  components: {
    Wallpaper,
    Scale,
    Screen,
  },
};
</script>

<style>
</style>