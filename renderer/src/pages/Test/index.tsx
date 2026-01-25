/**
 * 测试页面
 */

import { UpdateNotificationTest } from '../../components/update/UpdateNotificationTest'
import './Test.css'

export default function Test() {
  return (
    <div className="test">
      <h1 className="test__title">测试页面</h1>
      <p className="test__description">
        用于测试各种UI组件和交互效果
      </p>

      <div className="test__section">
        <UpdateNotificationTest />
      </div>
    </div>
  )
}
