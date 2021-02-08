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
      if (command.followQueue !== false) {
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
          if (state.current === -1) {
            return
          }
          const queueItem = state.queue[state.current];

          if (!!queueItem) {
            !!queueItem.undo && queueItem.undo()
            state.current--
          }
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
          const queueItem = state.queue[state.current + 1];
          if (!!queueItem) {
            queueItem.redo();
            state.current++
          }
        }
      }
    }
  })

  return {
    state,
    registry
  }
}