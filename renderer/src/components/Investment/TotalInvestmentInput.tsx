/**
 * 总投资金额输入组件
 *
 * 功能：
 * - 输入框后显示￥符号
 * - 只允许输入数字，不能为负数
 * - 实时千分位格式化
 * - 支持中文输入法
 * - 输入时自动增大宽度
 * - 玻璃态效果
 */

import { useState, useEffect, useRef } from 'react'
import { formatNumberWithThousands, parseThousandsNumber } from '../../utils/format/inputFormat'
import './TotalInvestmentInput.css'

interface TotalInvestmentInputProps {
  /** 当前值 */
  value: number
  /** 值变化回调 */
  onChange: (value: number) => void
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
}

export function TotalInvestmentInput({
  value,
  onChange,
  placeholder = '',
  disabled = false
}: TotalInvestmentInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [inputWidth, setInputWidth] = useState(200) // 初始宽度 200px
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_DIGITS = 16 // 最大数字位数限制

  // 初始化显示值
  useEffect(() => {
    if (value > 0) {
      // 将数值转为字符串并限制最大位数
      const valueStr = String(value)
      const limitedStr = valueStr.length > MAX_DIGITS ? valueStr.slice(0, MAX_DIGITS) : valueStr
      setDisplayValue(formatNumberWithThousands(limitedStr))
    } else {
      setDisplayValue('0')
    }
  }, [value])

  // 根据内容动态调整宽度（使用纯数字长度，不包含逗号）
  useEffect(() => {
    const calculateWidth = (formattedStr: string) => {
      // 移除逗号，只计算数字长度
      const numericLength = formattedStr.replace(/,/g, '').length

      const baseWidth = 100
      const charWidth = 12 // 增加字符宽度以适应数字显示
      const threshold = 3

      // 只有超过阈值才开始增长，最多增长到 MAX_DIGITS 位
      const extraChars = Math.max(0, Math.min(numericLength - threshold, MAX_DIGITS - threshold))
      const calculated = baseWidth + (extraChars * charWidth)
      return calculated
    }

    const newWidth = calculateWidth(displayValue)
    setInputWidth(newWidth)
  }, [displayValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 如果正在使用输入法，不处理输入
    if (isComposing) {
      setDisplayValue(e.target.value)
      return
    }

    const inputValue = e.target.value

    // 只允许数字
    let cleaned = inputValue.replace(/[^\d]/g, '')

    // 限制最大位数
    if (cleaned.length > MAX_DIGITS) {
      cleaned = cleaned.slice(0, MAX_DIGITS)
    }

    if (!cleaned) {
      setDisplayValue('0')
      onChange(0)
      return
    }

    // 格式化显示
    const formatted = formatNumberWithThousands(cleaned)
    setDisplayValue(formatted)

    // 解析为数字并回调
    const parsedValue = parseThousandsNumber(formatted)
    onChange(parsedValue)
  }

  const handleBlur = () => {
    // 失去焦点时为空则显示0
    if (!displayValue && value === 0) {
      setDisplayValue('0')
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)

    // 输入法结束后处理输入
    const inputValue = e.currentTarget.value

    // 只允许数字
    let cleaned = inputValue.replace(/[^\d]/g, '')

    // 限制最大位数
    if (cleaned.length > MAX_DIGITS) {
      cleaned = cleaned.slice(0, MAX_DIGITS)
    }

    if (!cleaned) {
      setDisplayValue('0')
      onChange(0)
      return
    }

    // 格式化显示
    const formatted = formatNumberWithThousands(cleaned)
    setDisplayValue(formatted)

    // 解析为数字并回调
    const parsedValue = parseThousandsNumber(formatted)
    onChange(parsedValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 按回车键时失去焦点
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }

  return (
    <div className="total-investment-input">
      <div className="total-investment-input__wrapper">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          className="total-investment-input__field"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          style={{ width: `${inputWidth}px` }}
        />
        <span className="total-investment-input__symbol">￥</span>
      </div>
    </div>
  )
}
