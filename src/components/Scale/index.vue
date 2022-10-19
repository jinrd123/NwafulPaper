<template>
  <div class="container"><slot></slot></div>
</template>

<script>
export default {
  props: {
    data: {
      domain: Array,
      range: {
        width: Array,
        height: Array,
        x: Array,
        y: Array,
      },
    },
  },
};
</script>

<style scoped>
</style>