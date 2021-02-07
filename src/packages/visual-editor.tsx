import { computed, defineComponent, PropType, ref } from "vue";
import "./visual-editor.scss";
import {
  createNewBlock,
  VisualEditorBlockData,
  VisualEditorComponent,
  VisualEditorConfig,
  VisualEditorModelValue,
} from "@/packages/visual-editor.utils";
import { useModel } from "./utils/useModel";
import { VisualEditorBlock } from "./visual-editor-block";
import { useCommander } from "./plugins/command.plugin";
import { useVisualCommand } from "./utils/visual.command";

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

    const focusData = computed(() => {
      let focus: VisualEditorBlockData[] = [];
      let unFocus: VisualEditorBlockData[] = [];
      dataModel.value.blocks.forEach((block) =>
        block.focus ? focus.push(block) : unFocus.push(block)
      );
      return {
        focus, // 选中的block
        unFocus, // 未选中的block
      };
    });

    const methods = {
      clearFocus: (block?: VisualEditorBlockData) => {
        let blocks = dataModel.value.blocks;
        if (blocks.length === 0) return;
        if (!!block) {
          blocks = blocks.filter((item) => item !== block);
        }
        blocks.forEach((block) => (block.focus = false));
      },
    };

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
          blocks.push(
            createNewBlock({
              component: component!,
              top: e.offsetY,
              left: e.offsetX,
            })
          );
          dataModel.value = {
            ...dataModel.value,
            blocks,
          };
        },
      };

      return blockHandler;
    })();

    const focusHandler = (() => {
      return {
        container: {
          onMousedown: (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            methods.clearFocus();
          },
        },
        block: {
          onMousedown: (e: MouseEvent, block: VisualEditorBlockData) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.shiftKey) {
              if (focusData.value.focus.length <= 1) {
                block.focus = true;
              } else {
                block.focus = !block.focus;
              }
            } else {
              if (!block.focus) {
                block.focus = true;
                methods.clearFocus(block);
              }
            }
            blockDraggier().mousedown(e);
          },
        },
      };
    })();

    const blockDraggier = () => {
      let dragState = {
        startX: 0,
        startY: 0,
        startPos: [] as { left: number; top: number }[],
      };
      const mousedown = (e: MouseEvent) => {
        dragState = {
          startX: e.clientX,
          startY: e.clientY,
          startPos: focusData.value.focus.map(({ top, left }) => ({
            top,
            left,
          })),
        };
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
      };

      const mousemove = (e: MouseEvent) => {
        const durX = e.clientX - dragState.startX;
        const durY = e.clientY - dragState.startY;
        focusData.value.focus.forEach((block, index) => {
          block.top = dragState.startPos[index].top + durY;
          block.left = dragState.startPos[index].left + durX;
        });
      };

      const mouseup = () => {
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
      };

      return { mousedown };
    };

    const commander = useVisualCommand();

    const buttons = [
      {
        label: "撤销",
        icon: "icon-back",
        handler: commander.undo,
        tip: "ctrl+z",
      },
      {
        label: "重做",
        icon: "icon-forward",
        handler: commander.redo,
        tip: "ctrl+y, ctrl+shift+z",
      },
      {
        label: "删除",
        icon: "icon-delete",
        handler: () => commander.delete(),
        tip: "ctrl+d, backspace, delete",
      },
    ];

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
        <div class="visual-editor-head">
          {buttons.map((btn, index: number) => <div key={index} class="visual-editor-head-button">
            <i class={`iconfont ${btn.icon}`}/>
            <span>{btn.label}</span>
          </div>)}
        </div>
        <div class="visual-editor-operator">visual-editor-operator</div>
        <div class="visual-editor-body">
          <div class="visual-editor-content">
            <div
              class="visual-editor-container"
              style={containerStyles.value}
              ref={containerRef}
              {...focusHandler.container}
            >
              {(dataModel.value?.blocks || []).map((block, index) => (
                <VisualEditorBlock
                  config={props.config}
                  block={block}
                  key={index}
                  {...{
                    onMousedown: (e: MouseEvent) =>
                      focusHandler.block.onMousedown(e, block),
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
