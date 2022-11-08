<template>
  <div v-if="options.type === 'container'">
    <attribute-tree
      v-for="child in options.children"
      :options="child"
      :key="child.key"
      :values="values"
    />
  </div>
  <group v-else-if="options.type === 'section'" :name="options.name">
    <attribute-tree
      v-for="child in options.children"
      :options="child"
      :key="child.key"
      :values="values"
    />
  </group>
  <feild v-else :name="options.name" :flex="options.type === 'image' ? 'col' : 'row'">
    <el-input
      v-if="options.type === 'text'"
      :placeholder="options.placeholder"
      v-model="value"
    />
    <el-color-picker v-if="options.type === 'color'" v-model="value" />
    <el-slider
      v-if="options.type === 'number'"
      v-model="value"
      :min="options.min"
      :max="options.max"
      :style="{ width: 150 + 'px' }"
    >
    </el-slider>
    <image-picker v-if="options.type === 'image'" v-model="value"></image-picker>
    <!-- <el-upload
      v-if="options.type === 'image'"
      class="upload"
      action=""
      :auto-upload="false"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      :limit="1"
    >
      <el-button size="small" type="primary"> select image </el-button>
    </el-upload> -->
  </feild>
</template>

<script>
import Feild from "./Field.vue";
import Group from "./Group.vue";
import ImagePicker from "@/components/ImagePicker";
import { get, set } from "@/utils/object";

export default {
  name: "attribute-tree",
  components: { Feild, Group, ImagePicker },
  props: {
    options: Object,
    values: Object,
  },
  computed: {
    value: {
      get() {
        const { key } = this.options;
        if (!key) return;
        return get(this.values, key);
      },
      set(newValue) {
        const { key } = this.options;
        if (!key) return;
        set(this.values, key, newValue);
      },
    },
  },
};
</script>
<style scoped>
.upload {
  width: 100%;
  text-align: left;
}
</style>

