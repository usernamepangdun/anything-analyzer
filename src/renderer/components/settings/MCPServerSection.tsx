import { useEffect, useState } from 'react'
import { InputNumber, Button, Space, Typography, Switch, Badge, message } from 'antd'
import type { MCPServerSettings } from '@shared/types'

const { Text } = Typography

export default function MCPServerSection() {
  const [enabled, setEnabled] = useState(false)
  const [port, setPort] = useState(23816)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    window.electronAPI.getMCPServerConfig().then(config => {
      setEnabled(config.enabled)
      setPort(config.port)
    })
    window.electronAPI.getMCPServerStatus().then(status => {
      setRunning(status.running)
    })
  }, [])

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <div>
        <Badge
          status={running ? 'success' : 'default'}
          text={running ? '运行中' : '已停止'}
          style={{ fontSize: 12 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>启用 MCP Server</Text>
        <Switch checked={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text>端口</Text>
            <InputNumber
              min={1024}
              max={65535}
              value={port}
              onChange={v => v && setPort(v)}
              style={{ width: 120 }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            外部工具配置 URL: <Text code copyable style={{ fontSize: 12 }}>http://localhost:{port}/mcp</Text>
          </Text>
        </>
      )}

      <Button type="primary" block onClick={async () => {
        const config: MCPServerSettings = { enabled, port }
        await window.electronAPI.saveMCPServerConfig(config)
        message.success('MCP Server 配置已保存，重启应用后生效')
        const status = await window.electronAPI.getMCPServerStatus()
        setRunning(status.running)
      }}>
        保存 MCP Server 设置
      </Button>
    </Space>
  )
}
