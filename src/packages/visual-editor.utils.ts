
export interface VisualEditorBlockData {
  componentKey: string,
  top: number,
  left: number,
  adjustPosition: boolean,    // 是否调整位置
  focus: boolean
}

export interface VisualEditorModelValue {
  container: {
    width: number,
    height: number
  },
  blocks: VisualEditorBlockData[]
}

export interface VisualEditorComponent{
  key: string,
  label: string,
  preview: () => JSX.Element,
  render: () => JSX.Element
}

export function createNewBlock({
  component,
  left,
  top
}: {
  component: VisualEditorComponent,
  top: number,
  left: number
}): VisualEditorBlockData {
  return {
    adjustPosition: true,
    top,
    left,
    componentKey: component!.key,
    focus: false
  }
}

export function createVisualEditorConfig() {
  const componentList: VisualEditorComponent[] = [];
  const componentMap: Record<string, VisualEditorComponent> = {};
  return {
    componentList,
    componentMap,
    registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
      let comp = {...component, key}
      componentList.push(comp)
      componentMap[key] = comp;
    }
  }
}

export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>

