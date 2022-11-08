<template>
  <el-menu
    default-active="/home"
    mode="horizontal"
    :router="true"
    :defaultActive="$route.path"
    background-color="#24292f"
    text-color="#ffffff"
    active-text-color="#999999"
  >
    <el-menu-item index="/home">Home</el-menu-item>
    <el-menu-item index="/editor">Editor</el-menu-item>
    <el-menu-item index="/background">BackGround</el-menu-item>
    <el-menu-item index=""
      ><a href="https://gitee.com/jin-rongda/nwaful-paper" target="_blank">Gitee</a></el-menu-item
    >
  </el-menu>
</template>

<script>
export default {
  name: "NavHeader",
};
</script>

<style>
.el-menu {
  display: flex;
  justify-content: flex-end;
}
</style>