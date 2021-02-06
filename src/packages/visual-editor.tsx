import { computed, defineComponent, PropType, ref } from "vue";
import "./visual-editor.scss";
import {
  VisualEditorComponent,
  VisualEditorConfig,
  VisualEditorModelValue,
} from "@/packages/visual-editor.utils";
import { useModel } from "./utils/useModel";
import { VisualEditorBlock } from "./visual-editor-block";

export const VisualEditor = defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<VisualEditorModelValue>,
      required: true,
    },
    config: {
      type: Object as PropType<VisualEditorConfig>,
      required: true,
    },
  },
  emits: {
    "update:modelValue": (val?: VisualEditorModelValue) => true,
  },
  setup(props, ctx) {
    const dataModel = useModel(
      () => props.modelValue,
      (val) => ctx.emit("update:modelValue", val)
    );

    const containerRef = ref({} as HTMLDivElement);
    const containerStyles = computed(() => ({
      width: `${dataModel.value.container.width}px`,
      height: `${dataModel.value.container.height}px`,
    }));

    const menuDraggier = (() => {
      let component = null as null | VisualEditorComponent;

      const blockHandler = {
        dragstart: (e: DragEvent, current: VisualEditorComponent) => {
          containerRef.value.addEventListener(
            "dragenter",
            containerHandler.dragenter
          );
          containerRef.value.addEventListener(
            "dragover",
            containerHandler.dragover
          );
          containerRef.value.addEventListener(
            "dragleave",
            containerHandler.dragleave
          );
          containerRef.value.addEventListener("drop", containerHandler.drop);
          component = current;
        },
        dragend: () => {
          containerRef.value.removeEventListener(
            "dragenter",
            containerHandler.dragenter
          );
          containerRef.value.removeEventListener(
            "dragover",
            containerHandler.dragover
          );
          containerRef.value.removeEventListener(
            "dragleave",
            containerHandler.dragleave
          );
          containerRef.value.removeEventListener("drop", containerHandler.drop);
          component = null;
        },
      };

      const containerHandler = {
        dragenter: (e: DragEvent) => {
          e.dataTransfer!.dropEffect = "move";
        },
        dragover: (e: DragEvent) => {
          e.preventDefault();
        },
        dragleave: (e: DragEvent) => {
          e.dataTransfer!.dropEffect = "none";
        },
        drop: (e: DragEvent) => {
          const blocks = dataModel.value.blocks || [];
          blocks.push({
            top: e.offsetY,
            left: e.offsetX,
          });
          dataModel.value = {
            ...dataModel.value,
            blocks,
          };
        },
      };

      return blockHandler;
    })();

    return () => (
      <div class="visual-editor">
        <div class="visual-editor-menu">
          {props.config.componentList.map((component) => (
            <div
              class="visual-editor-menu-item"
              draggable
              onDragend={menuDraggier.dragend}
              onDragstart={(e) => menuDraggier.dragstart(e, component)}
            >
              <span class="visual-editor-menu-item-label">
                {component.label}
              </span>
              {component.preview()}
            </div>
          ))}
        </div>
        <div class="visual-editor-head">visual-editor-head</div>
        <div class="visual-editor-operator">visual-editor-operator</div>
        <div class="visual-editor-body">
          <div class="visual-editor-content">
            <div
              class="visual-editor-container"
              style={containerStyles.value}
              ref={containerRef}
            >
              {(dataModel.value?.blocks || []).map((block, index) => (
                <VisualEditorBlock block={block} key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
