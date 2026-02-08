/**
 * 日志工具
 *
 * 提供条件日志功能，只在开发环境输出
 */

class Logger {
  private isDev = import.meta.env.DEV

  debug(...args: unknown[]): void {
    if (this.isDev) {
      console.log('[Debug]', ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.isDev) {
      console.info('[Info]', ...args)
    }
  }

  warn(...args: unknown[]): void {
    console.warn('[Warn]', ...args)
  }

  error(...args: unknown[]): void {
    console.error('[Error]', ...args)
  }
}

export const logger = new Logger()
