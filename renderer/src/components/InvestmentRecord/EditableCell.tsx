/**
 * 可编辑单元格组件
 *
 * 支持点击编辑、失焦保存的可编辑单元格
 */

import { useState, useRef, useEffect } from 'react'
import './EditableCell.css'

export interface EditableCellProps {
  /** 当前值 */
  value: number | string
  /** 值变化回调 */
  onChange: (value: string) => void
  /** 输入框类型 */
  type?: 'number' | 'text'
  /** 占位符 */
  placeholder?: string
  /** 最小值（number类型） */
  min?: number
  /** 最大值（number类型） */
  max?: number
  /** 步长（number类型） */
  step?: number
  /** 显示格式化函数 */
  displayFormat?: (value: number) => string
  /** 数据属性（用于键盘导航等） */
  'data-row-id'?: string
  'data-field'?: string
}

export function EditableCell({
  value,
  onChange,
  type = 'number',
  placeholder = '0',
  min,
  max,
  step,
  displayFormat,
  'data-row-id': dataRowId,
  'data-field': dataField
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  // 进入编辑模式时聚焦输入框并选中内容
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // 处理显示区域点击
  const handleDisplayClick = () => {
    setIsEditing(true)
    setEditValue(String(value))
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  // 处理输入框失焦
  const handleInputBlur = () => {
    setIsEditing(false)
    onChange(editValue)
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(String(value))
    }
  }

  // 处理显示区域的键盘事件
  const handleDisplayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsEditing(true)
    }
  }

  // 格式化显示值
  const displayValue = type === 'number' && displayFormat
    ? displayFormat(Number(value))
    : String(value)

  return (
    <div className="editable-cell">
      {isEditing ? (
        <input
          ref={inputRef}
          type={type}
          className="editable-cell__input"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          data-row-id={dataRowId}
          data-field={dataField}
        />
      ) : (
        <div
          className="editable-cell__display"
          onClick={handleDisplayClick}
          onKeyDown={handleDisplayKeyDown}
          role="button"
          tabIndex={0}
          title="点击编辑"
        >
          {displayValue || <span className="editable-cell__placeholder">{placeholder}</span>}
        </div>
      )}
    </div>
  )
}
