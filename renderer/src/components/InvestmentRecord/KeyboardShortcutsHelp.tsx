/**
 * 快捷键帮助面板
 */

import { useEffect, useState } from 'react'
import './KeyboardShortcutsHelp.css'

const shortcuts = [
  { keys: ['Tab'], description: '移动到下一个输入框' },
  { keys: ['Shift', 'Tab'], description: '移动到上一个输入框' },
  { keys: ['Enter'], description: '确认并移到下一行' },
  { keys: ['Escape'], description: '取消当前编辑' },
  { keys: ['Delete'], description: '删除当前行' },
  { keys: ['Ctrl', 'Z'], description: '撤销' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: '重做' }
]

export interface KeyboardShortcutsHelpProps {
  /** 是否显示 */
  show: boolean
  /** 关闭回调 */
  onClose: () => void
}

export function KeyboardShortcutsHelp({ show, onClose }: KeyboardShortcutsHelpProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    } else {
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [show])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [show, onClose])

  if (!show && !isVisible) return null

  return (
    <>
      <div
        className={`keyboard-shortcuts-overlay ${show ? 'show' : ''}`}
        onClick={onClose}
      />
      <div className={`keyboard-shortcuts-panel ${show ? 'show' : ''}`}>
        <div className="keyboard-shortcuts-header">
          <h2>键盘快捷键</h2>
          <button className="keyboard-shortcuts-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="keyboard-shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="keyboard-shortcut-item">
              <div className="keyboard-shortcut-keys">
                {shortcut.keys.map((key, i) => (
                  <span key={i} className="keyboard-shortcut-key">
                    {key}
                    {i < shortcut.keys.length - 1 && <span className="keyboard-shortcut-plus">+</span>}
                  </span>
                ))}
              </div>
              <div className="keyboard-shortcut-description">{shortcut.description}</div>
            </div>
          ))}
        </div>
        <div className="keyboard-shortcuts-footer">
          <button className="keyboard-shortcuts-close-btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </>
  )
}
