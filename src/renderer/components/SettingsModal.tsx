import { useState } from 'react'
import { Modal, Typography } from 'antd'
import {
  AppstoreOutlined,
  RobotOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import GeneralSection from './settings/GeneralSection'
import LLMSection from './settings/LLMSection'
import ProxySection from './settings/ProxySection'
import MCPServerSection from './settings/MCPServerSection'
import MitmProxySection from './settings/MitmProxySection'

const { Text } = Typography

type SettingsSection = 'general' | 'llm' | 'proxy' | 'mcp-server' | 'mitm-proxy'

const menuItems: { key: SettingsSection; icon: typeof AppstoreOutlined; label: string }[] = [
  { key: 'general', icon: AppstoreOutlined, label: '通用' },
  { key: 'llm', icon: RobotOutlined, label: 'LLM' },
  { key: 'proxy', icon: GlobalOutlined, label: '代理' },
  { key: 'mcp-server', icon: ThunderboltOutlined, label: 'MCP Server' },
  { key: 'mitm-proxy', icon: SafetyCertificateOutlined, label: 'MITM 代理' },
]

const sectionComponents: Record<SettingsSection, React.ComponentType> = {
  'general': GeneralSection,
  'llm': LLMSection,
  'proxy': ProxySection,
  'mcp-server': MCPServerSection,
  'mitm-proxy': MitmProxySection,
}

interface Props { open: boolean; onClose: () => void }

export default function SettingsModal({ open, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')

  const ActiveComponent = sectionComponents[activeSection]

  return (
    <Modal
      title="Settings"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', height: 560 }}>
        {/* Left sidebar navigation */}
        <div style={{
          width: 180,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 12,
          paddingBottom: 12,
          flexShrink: 0,
          overflow: 'auto',
        }}>
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = activeSection === item.key
            return (
              <div
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 6,
                  margin: '2px 8px',
                  fontSize: 13,
                  background: isActive ? 'rgba(22, 119, 255, 0.15)' : 'transparent',
                  color: isActive ? '#1677ff' : '#d9d9d9',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget.style.background = 'transparent')
                }}
              >
                <Icon style={{ fontSize: 16 }} />
                <Text style={{ color: 'inherit', fontSize: 'inherit' }}>{item.label}</Text>
              </div>
            )
          })}
        </div>

        {/* Right content area */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <ActiveComponent />
        </div>
      </div>
    </Modal>
  )
}
