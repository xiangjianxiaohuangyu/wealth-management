/**
 * 测试区设置弹窗组件
 *
 * 功能：
 * - 选择投资金额计算方式
 * - 根据总收入计算 or 根据总投资金额计算
 */

import { Modal } from '../common/Modal'
import type { CalculationMethod } from '../../types/testZoneSettings.types'
import './TestZoneSettings.css'

export interface TestZoneSettingsProps {
  /** 是否打开弹窗 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 当前计算方式 */
  currentMethod: CalculationMethod
  /** 计算方式变更回调 */
  onMethodChange: (method: CalculationMethod) => void
}

export function TestZoneSettings({
  isOpen,
  onClose,
  currentMethod,
  onMethodChange
}: TestZoneSettingsProps) {
  const handleMethodSelect = (method: CalculationMethod) => {
    onMethodChange(method)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="测试区设置">
      <div className="testzone-settings">
        <p className="testzone-settings__label">投资金额计算方式：</p>
        <div className="testzone-settings__options">
          <button
            className={`testzone-settings__option ${currentMethod === 'total-income' ? 'testzone-settings__option--active' : ''}`}
            onClick={() => handleMethodSelect('total-income')}
          >
            <span className="testzone-settings__option-icon">💵</span>
            <div className="testzone-settings__option-content">
              <div className="testzone-settings__option-title">根据总收入计算</div>
              <div className="testzone-settings__option-desc">
                投资金额 = 总收入 × 投资比例
              </div>
            </div>
          </button>
          <button
            className={`testzone-settings__option ${currentMethod === 'total-investment' ? 'testzone-settings__option--active' : ''}`}
            onClick={() => handleMethodSelect('total-investment')}
          >
            <span className="testzone-settings__option-icon">📈</span>
            <div className="testzone-settings__option-content">
              <div className="testzone-settings__option-title">根据总投资金额计算</div>
              <div className="testzone-settings__option-desc">
                投资金额 = 总投资金额 × 投资比例
              </div>
            </div>
          </button>
        </div>
        <div className="testzone-settings__note">
          ℹ️ 切换计算方式将影响所有表格中的投资金额计算
        </div>
      </div>
    </Modal>
  )
}
