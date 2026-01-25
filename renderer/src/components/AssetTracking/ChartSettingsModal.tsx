/**
 * 图表设置模态框组件
 *
 * 用于控制资产趋势图表中显示的曲线
 */

import { Modal } from '../common/Modal'
import type { ChartSettings } from '../../types/assetTracking.types'
import './ChartSettingsModal.css'

export interface ChartSettingsModalProps {
  /** 是否显示模态框 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 图表设置 */
  chartSettings: ChartSettings
  /** 图表设置变化回调 */
  onChartSettingsChange: (settings: ChartSettings) => void
}

export function ChartSettingsModal({
  isOpen,
  onClose,
  chartSettings,
  onChartSettingsChange
}: ChartSettingsModalProps) {
  const handleToggle = (key: keyof ChartSettings) => {
    onChartSettingsChange({
      ...chartSettings,
      [key]: !chartSettings[key]
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="图表设置"
      footer={
        <>
          <button className="chart-settings-modal__btn chart-settings-modal__btn--cancel" onClick={onClose}>
            取消
          </button>
          <button className="chart-settings-modal__btn chart-settings-modal__btn--confirm" onClick={onClose}>
            确定
          </button>
        </>
      }
    >
      <div className="chart-settings-modal">
        <label className="chart-settings-option">
          <input
            type="checkbox"
            checked={chartSettings.totalAssets}
            onChange={() => handleToggle('totalAssets')}
          />
          <span>总资产</span>
        </label>
        <label className="chart-settings-option">
          <input
            type="checkbox"
            checked={chartSettings.investment}
            onChange={() => handleToggle('investment')}
          />
          <span>投资金额</span>
        </label>
        <label className="chart-settings-option">
          <input
            type="checkbox"
            checked={chartSettings.savings}
            onChange={() => handleToggle('savings')}
          />
          <span>存款</span>
        </label>
        <label className="chart-settings-option">
          <input
            type="checkbox"
            checked={chartSettings.fixedAssets}
            onChange={() => handleToggle('fixedAssets')}
          />
          <span>固定资产</span>
        </label>
      </div>
    </Modal>
  )
}
