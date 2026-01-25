/**
 * 数字动画 Hook
 *
 * 实现数字从起始值到目标值的平滑增长动画
 * - 首次渲染时从 0 动画到目标值
 * - 值变化时从当前值动画到新值
 * - forceAnimation 为 true 时强制触发动画（即使值相同）
 */

import { useState, useEffect, useRef } from 'react'

export function useNumberAnimation(
  targetValue: number,
  duration: number = 2000,
  forceAnimation: boolean = false
) {
  const [currentValue, setCurrentValue] = useState(targetValue)
  const animationRef = useRef<number | null>(null)
  const prevValueRef = useRef(targetValue)
  const prevTargetRef = useRef(targetValue)
  const isFirstRender = useRef(true)
  const prevForceAnimationRef = useRef(false)

  // 检测 forceAnimation 从 false 变为 true 的边缘触发
  const forceAnimationTriggered = forceAnimation && !prevForceAnimationRef.current
  prevForceAnimationRef.current = forceAnimation

  useEffect(() => {
    // 处理 NaN
    if (isNaN(targetValue)) {
      setCurrentValue(0)
      prevValueRef.current = 0
      prevTargetRef.current = 0
      return
    }

    // 确定起始值
    let startValue: number
    const shouldRunAnimation =
      isFirstRender.current ||
      forceAnimationTriggered ||
      prevTargetRef.current !== targetValue

    if (!shouldRunAnimation) {
      // 不需要动画，直接设置为目标值
      setCurrentValue(targetValue)
      prevValueRef.current = targetValue
      prevTargetRef.current = targetValue
      return
    }

    // 首次渲染从 0 开始，否则从当前显示的值开始
    startValue = isFirstRender.current ? 0 : prevValueRef.current
    isFirstRender.current = false

    // 动画函数
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用 easeOutQuad 缓动函数 - 更平滑的原地增长效果
      const easeOutQuad = (t: number): number => {
        return t * (2 - t)
      }

      const easedProgress = easeOutQuad(progress)
      const newValue = startValue + (targetValue - startValue) * easedProgress

      setCurrentValue(newValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = targetValue
        prevTargetRef.current = targetValue
      }
    }

    // 开始动画
    animationRef.current = requestAnimationFrame(animate)

    // 清理函数
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration, forceAnimationTriggered])

  return currentValue
}

