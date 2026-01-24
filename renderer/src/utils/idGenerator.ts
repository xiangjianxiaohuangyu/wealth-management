/**
 * 生成唯一ID
 */

/**
 * 生成随机ID
 * @returns 随机ID字符串
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
