/**
 * useLocalStorage Hook
 *
 * 提供与 localStorage 同步的 React 状态
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook 参数
 */
export interface UseLocalStorageOptions<T> {
  /** 序列化函数 */
  serialize?: (value: T) => string
  /** 反序列化函数 */
  deserialize?: (value: string) => T
  /** 监听 storage 事件 */
  listenToStorageEvent?: boolean
}

/**
 * useLocalStorage Hook
 *
 * @param key - localStorage 键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns [storedValue, setValue, removeValue] - 存储的值、设置值函数、删除值函数
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [name, setName, removeName] = useLocalStorage('name', 'Guest')
 *
 *   return (
 *     <div>
 *       <input value={name} onChange={(e) => setName(e.target.value)} />
 *       <button onClick={removeName}>清除</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    listenToStorageEvent = true
  } = options

  // 从 localStorage 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 设置值的函数
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, serialize(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, serialize, storedValue])

  // 删除值的函数
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // 监听其他标签页的 storage 事件
  useEffect(() => {
    if (!listenToStorageEvent) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue))
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserialize, listenToStorageEvent])

  return [storedValue, setValue, removeValue]
}

/**
 * 简化版本的 useLocalStorage，只返回值和设置函数
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useLocalStorage(key, initialValue)
  return [value, setValue]
}
