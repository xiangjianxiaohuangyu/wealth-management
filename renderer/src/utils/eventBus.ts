/**
 * 事件总线
 *
 * 提供跨组件的事件通信机制，用于替代轮询，提升性能
 *
 * 使用示例：
 * ```typescript
 * // 发送事件
 * eventBus.emit('data-changed')
 *
 * // 监听事件
 * eventBus.on('data-changed', () => { ... })
 *
 * // 取消监听
 * eventBus.off('data-changed', callback)
 * ```
 */

class EventBus {
  private listeners = new Map<string, Set<() => void>>()

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param callback 回调函数
   */
  on(event: string, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * 取消事件监听器
   * @param event 事件名称
   * @param callback 回调函数
   */
  off(event: string, callback: () => void): void {
    this.listeners.get(event)?.delete(callback)

    // 如果该事件没有监听器了，删除 Map 中的条目
    if (this.listeners.get(event)?.size === 0) {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   */
  emit(event: string): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    })
  }

  /**
   * 移除某个事件的所有监听器
   * @param event 事件名称
   */
  clear(event: string): void {
    this.listeners.delete(event)
  }

  /**
   * 移除所有事件的监听器
   */
  clearAll(): void {
    this.listeners.clear()
  }

  /**
   * 获取某个事件的监听器数量
   * @param event 事件名称
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0
  }
}

// 导出单例
export const eventBus = new EventBus()
