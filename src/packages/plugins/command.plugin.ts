import { reactive } from "vue"

export interface CommandExecute {
  // 将做的事情还原
  undo?: () => void,
  // 重新做一遍要做的事情
  redo: () => void
}

export interface Command {
  name: string,  // 命令名称
  keyboard?: string | string[], // 命令快捷键
  execute: (...args: any[]) => CommandExecute, // 命令内容
  followQueue?: boolean // 执行完命令后是否将undo，redo放入命令队列
}

export function useCommander() {

  const state = reactive({
    current: -1,
    commands: {} as Record<string, (...args: any[]) => void>,
    queue: [] as CommandExecute[]
  })

  const registry = (command: Command) => {
    state.commands[command.name] = (...args) => {
      const { undo, redo } = command.execute(...args);
      if (command.followQueue) {
        state.queue.push({ undo, redo });
        state.current += 1;
      }
      redo();
    }
  }

  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          let { current } = state;
          if (current === -1) return;
          const { undo } = state.queue[current];
          !!undo && undo();
          state.current -= 1;
        }
      }
    }
  })

  registry({
    name: 'redo',
    keyboard: [
      'ctrl+y',
      'ctrl+shift+z'
    ],
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          let { current } = state;
          if (!state.queue[current]) return;
          const { redo } = state.queue[current];
          redo();
          state.current += 1;
        }
      }
    }
  })

  return {
    state,
    registry
  }
}