import { useEffect, useState, useCallback } from 'react'
import { Button, Progress, Space, Tag, Typography, message } from 'antd'
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, CloudDownloadOutlined, EditOutlined, ApiOutlined } from '@ant-design/icons'
import type { UpdateStatus } from '@shared/types'
import PromptTemplateModal from '../PromptTemplateModal'
import MCPServerModal from '../MCPServerModal'

const { Text } = Typography

export default function GeneralSection() {
  const [appVersion, setAppVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [mcpModalOpen, setMcpModalOpen] = useState(false)

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setAppVersion)
  }, [])

  // Subscribe to update status events
  useEffect(() => {
    window.electronAPI.onUpdateStatus((status: UpdateStatus) => {
      setUpdateStatus(status)
    })
    return () => {
      window.electronAPI.removeAllListeners('update:status')
    }
  }, [])

  const handleCheckUpdate = useCallback(() => {
    setUpdateStatus({ state: 'checking' })
    window.electronAPI.checkForUpdate()
  }, [])

  const handleInstallUpdate = useCallback(() => {
    window.electronAPI.installUpdate()
  }, [])

  return (
    <>
      {/* About & Version */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>Anything Analyzer</Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>v{appVersion}</Text>
      </div>

      {/* Update */}
      <Space style={{ width: '100%', marginBottom: 4 }}>
        {updateStatus.state === 'idle' && (
          <Button size="small" icon={<SyncOutlined />} onClick={handleCheckUpdate}>检查更新</Button>
        )}
        {updateStatus.state === 'checking' && (
          <Button size="small" icon={<SyncOutlined spin />} disabled>正在检查...</Button>
        )}
        {updateStatus.state === 'not-available' && (
          <>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text>已是最新版本</Text>
            <Button size="small" onClick={handleCheckUpdate}>重新检查</Button>
          </>
        )}
        {updateStatus.state === 'available' && (
          <>
            <Tag color="blue">v{updateStatus.info?.version} 可用</Tag>
            <Text type="secondary">正在下载...</Text>
          </>
        )}
        {updateStatus.state === 'downloaded' && (
          <>
            <CloudDownloadOutlined style={{ color: '#1677ff' }} />
            <Text>v{updateStatus.info?.version} 已就绪</Text>
            <Button type="primary" size="small" onClick={handleInstallUpdate}>立即重启更新</Button>
          </>
        )}
        {updateStatus.state === 'error' && (
          <>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <Text type="danger" style={{ fontSize: 12 }}>{updateStatus.error}</Text>
            <Button size="small" onClick={handleCheckUpdate}>重试</Button>
          </>
        )}
      </Space>

      {updateStatus.state === 'downloading' && (
        <Progress
          percent={Math.round(updateStatus.progress?.percent ?? 0)}
          size="small"
          status="active"
          style={{ marginBottom: 4 }}
        />
      )}

      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 13, marginBottom: 12, display: 'block' }}>管理工具</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<EditOutlined />} block onClick={() => setTemplateModalOpen(true)}>
            管理提示词模板
          </Button>
          <Button icon={<ApiOutlined />} block onClick={() => setMcpModalOpen(true)}>
            管理 MCP 服务器
          </Button>
        </Space>
      </div>

      <PromptTemplateModal open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} />
      <MCPServerModal open={mcpModalOpen} onClose={() => setMcpModalOpen(false)} />
    </>
  )
}
