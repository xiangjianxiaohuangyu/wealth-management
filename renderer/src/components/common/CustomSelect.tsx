/**
 * 自定义下拉选择组件
 *
 * 完全自定义样式，支持橙色液态玻璃效果
 */

import { useState, useRef, useEffect } from 'react'
import './CustomSelect.css'

export interface SelectOption {
  /** 选项值 */
  value: string
  /** 显示文本 */
  label: string
}

export interface CustomSelectProps {
  /** 当前值 */
  value: string
  /** 值变化回调 */
  onChange: (value: string) => void
  /** 选项列表 */
  options: SelectOption[]
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符 */
  placeholder?: string
  /** 类名 */
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = '请选择',
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取当前选中的选项
  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption?.label || placeholder

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // 选择选项
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  // 切换下拉状态
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`custom-select ${className} ${isOpen ? 'custom-select--open' : ''} ${disabled ? 'custom-select--disabled' : ''}`}
    >
      {/* 触发按钮 */}
      <div
        className="custom-select__trigger"
        onClick={toggleDropdown}
      >
        <span className="custom-select__value">{displayValue}</span>
        <span className={`custom-select__arrow ${isOpen ? 'custom-select__arrow--open' : ''}`}>
          ▼
        </span>
      </div>

      {/* 选项列表 */}
      {isOpen && (
        <div className="custom-select__dropdown">
          <div className="custom-select__options">
            {options.map(option => (
              <div
                key={option.value}
                className={`custom-select__option ${option.value === value ? 'custom-select__option--selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
