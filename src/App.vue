<template>
  <div id="app">
    <NavHeader />
    <router-view></router-view>
  </div>
</template>

<script>
import NavHeader from "@/components/NavHeader";
export default {
  name: "App",
  components: {
    NavHeader,
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
}
</style>
