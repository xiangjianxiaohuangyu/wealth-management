/**
 * 键盘快捷键 Hook
 *
 * 用于管理键盘快捷键
 */

import { useEffect, useRef } from 'react'

export interface ShortcutConfig {
  /** 快捷键描述 */
  description: string
  /** 键盘组合键（如 'Ctrl+S', 'Tab', 'Enter'） */
  keys: string
  /** 回调函数 */
  callback: (event: KeyboardEvent) => void
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 键盘快捷键 Hook
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts)

  // 更新 ref
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = event.target as HTMLElement
      const isInInput = target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.contentEditable === 'true'

      shortcutsRef.current.forEach(shortcut => {
        if (shortcut.disabled) return

        // 解析快捷键
        const keys = shortcut.keys.toLowerCase().split('+')
        const ctrlKey = keys.includes('ctrl') || keys.includes('cmd')
        const shiftKey = keys.includes('shift')
        const altKey = keys.includes('alt')
        const key = keys[keys.length - 1] // 最后一个是主键

        // 检查是否匹配
        const keyMatch = event.key.toLowerCase() === key.toLowerCase() ||
                        (key === 'escape' && event.key === 'Escape') ||
                        (key === 'enter' && event.key === 'Enter') ||
                        (key === 'tab' && event.key === 'Tab') ||
                        (key === 'delete' && event.key === 'Delete') ||
                        (key === 'backspace' && event.key === 'Backspace')

        const ctrlMatch = (ctrlKey && (event.ctrlKey || event.metaKey)) || !ctrlKey
        const shiftMatch = (shiftKey && event.shiftKey) || !shiftKey
        const altMatch = (altKey && event.altKey) || !altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // 某些快捷键在输入框中也有效（如 Tab, Enter, Escape）
          const allowedInInput = ['tab', 'enter', 'escape', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key.toLowerCase())

          if (!isInInput || allowedInInput) {
            event.preventDefault()
            shortcut.callback(event)
          }
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
