<template>
  <div class="app">
    <h1>这个是页面内容</h1>
    <VisualEditor
      v-model="jsonData"
      :config="visualConfig"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VisualEditor } from "@/packages/visual-editor";
import { visualConfig } from "@/visual.config";

export default defineComponent({
  name: "App",
  components: {
    VisualEditor,
  },
  data() {
    return {
      visualConfig,
      jsonData: {
        container: {
          height: 500,
          width: 800,
        },
        blocks: [
           {
            top: 200,
            left: 100,
            componentKey: "text",
            focus: true,
          },
          {
            top: 100,
            left: 100,
            componentKey: "button",
            focus: true,
          },
          {
            top: 200,
            left: 200,
            componentKey: "input",
            focus: true,
          },
        ],
      },
    };
  }
});
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
</style>
