import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { VisualEditorBlockData, VisualEditorConfig } from "./visual-editor.utils";

export const VisualEditorBlock = defineComponent({
  props: {
    block: {type: Object as PropType<VisualEditorBlockData>, required: true},
    config: {type: Object as PropType<VisualEditorConfig>, required: true}
  },
  setup(props) {
    const el = ref({} as HTMLDivElement)
    const styles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`
    }))

    onMounted(() => {
     const block = props.block;
     if(block.adjustPosition === true) {
      const {offsetHeight, offsetWidth} = el.value;
      block.left = block.left - offsetWidth / 2;
      block.top = block.top - offsetHeight / 2;
      block.adjustPosition = false;
     }
    })

    return () => {
      const component = props.config.componentMap[props.block.componentKey];
      const Render = component.render();
      return <div class="visual-editor-block" ref={el} style={styles.value}>
        {Render}
    </div>
    }
  }
})