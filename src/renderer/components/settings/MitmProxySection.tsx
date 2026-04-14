import { useEffect, useState } from 'react'
import { InputNumber, Button, Space, Typography, Switch, Badge, Alert, Tooltip, Modal, message } from 'antd'
import { SafetyCertificateOutlined, ExportOutlined, DeleteOutlined, ReloadOutlined, WifiOutlined } from '@ant-design/icons'
import type { MitmProxyConfig } from '@shared/types'

const { Text } = Typography

export default function MitmProxySection() {
  const [mitmEnabled, setMitmEnabled] = useState(false)
  const [mitmPort, setMitmPort] = useState(8888)
  const [mitmRunning, setMitmRunning] = useState(false)
  const [mitmCaInstalled, setMitmCaInstalled] = useState(false)
  const [mitmCaInitialized, setMitmCaInitialized] = useState(false)
  const [mitmSystemProxy, setMitmSystemProxy] = useState(false)
  const [mitmLoading, setMitmLoading] = useState(false)

  useEffect(() => {
    window.electronAPI.getMitmProxyConfig().then(config => {
      setMitmEnabled(config.enabled)
      setMitmPort(config.port)
      setMitmCaInstalled(config.caInstalled)
      setMitmSystemProxy(config.systemProxy)
    })
    window.electronAPI.getMitmProxyStatus().then(status => {
      setMitmRunning(status.running)
      setMitmCaInitialized(status.caInitialized)
      if (status.caInstalled !== undefined) setMitmCaInstalled(status.caInstalled)
      if (status.systemProxyEnabled !== undefined) setMitmSystemProxy(status.systemProxyEnabled)
    })
  }, [])

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={8}>
      <div>
        <Badge
          status={mitmRunning ? 'success' : 'default'}
          text={mitmRunning ? '运行中' : '已停止'}
          style={{ fontSize: 12 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>启用 MITM 代理</Text>
        <Switch checked={mitmEnabled} onChange={setMitmEnabled} />
      </div>

      {mitmEnabled && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text>端口</Text>
            <InputNumber
              min={1024}
              max={65535}
              value={mitmPort}
              onChange={v => v && setMitmPort(v)}
              style={{ width: 120 }}
            />
          </div>

          {/* System Proxy Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tooltip title="将系统 HTTP/HTTPS 代理指向 MITM 代理，无需手动配置即可捕获所有应用流量">
              <Text><WifiOutlined style={{ marginRight: 4 }} />设为系统代理</Text>
            </Tooltip>
            <Switch
              checked={mitmSystemProxy}
              loading={mitmLoading}
              onChange={async (checked) => {
                setMitmLoading(true)
                try {
                  if (checked) {
                    const result = await window.electronAPI.enableMitmSystemProxy()
                    if (result.success) {
                      setMitmSystemProxy(true)
                      message.success('已设为系统代理')
                    } else {
                      message.error(result.error || '设置系统代理失败')
                    }
                  } else {
                    const result = await window.electronAPI.disableMitmSystemProxy()
                    if (result.success) {
                      setMitmSystemProxy(false)
                      message.success('已取消系统代理')
                    } else {
                      message.error(result.error || '取消系统代理失败')
                    }
                  }
                } finally {
                  setMitmLoading(false)
                }
              }}
            />
          </div>
          {mitmSystemProxy && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              所有应用的流量将自动通过 MITM 代理，关闭应用时自动还原
            </Text>
          )}

          {/* CA Certificate Management */}
          <div style={{ marginTop: 4 }}>
            <Text strong style={{ fontSize: 13 }}>CA 证书管理</Text>
          </div>

          {!mitmCaInstalled ? (
            <>
              <Alert
                type="warning"
                showIcon
                message="CA 证书未安装到系统，HTTPS 流量将无法拦截"
                style={{ padding: '4px 12px' }}
              />
              <Space>
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  loading={mitmLoading}
                  onClick={async () => {
                    setMitmLoading(true)
                    try {
                      const result = await window.electronAPI.installMitmCA()
                      if (result.success) {
                        setMitmCaInstalled(true)
                        message.success('CA 证书已安装到系统信任链')
                      } else {
                        message.error(result.error || '安装失败')
                      }
                    } finally {
                      setMitmLoading(false)
                    }
                  }}
                >
                  一键安装 CA 证书
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => window.electronAPI.exportMitmCA()}
                >
                  导出
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Alert
                type="success"
                showIcon
                message="CA 证书已安装"
                style={{ padding: '4px 12px' }}
              />
              <Space wrap>
                <Button
                  icon={<DeleteOutlined />}
                  loading={mitmLoading}
                  onClick={async () => {
                    setMitmLoading(true)
                    try {
                      const result = await window.electronAPI.uninstallMitmCA()
                      if (result.success) {
                        setMitmCaInstalled(false)
                        message.success('CA 证书已卸载')
                      } else {
                        message.error(result.error || '卸载失败')
                      }
                    } finally {
                      setMitmLoading(false)
                    }
                  }}
                >
                  卸载证书
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => window.electronAPI.exportMitmCA()}
                >
                  导出
                </Button>
                <Button
                  danger
                  icon={<ReloadOutlined />}
                  loading={mitmLoading}
                  onClick={async () => {
                    Modal.confirm({
                      title: '重新生成 CA',
                      content: '重新生成后需要重新安装证书，已配置代理的设备将出现证书错误。确定继续？',
                      okText: '确认',
                      cancelText: '取消',
                      onOk: async () => {
                        setMitmLoading(true)
                        try {
                          await window.electronAPI.regenerateMitmCA()
                          setMitmCaInstalled(false)
                          setMitmRunning(false)
                          message.success('CA 已重新生成，请重新安装证书')
                        } finally {
                          setMitmLoading(false)
                        }
                      },
                    })
                  }}
                >
                  重新生成 CA
                </Button>
              </Space>
            </>
          )}

          {/* Usage Instructions */}
          {!mitmSystemProxy && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                在外部浏览器/设备中配置 HTTP 代理为：
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text code copyable style={{ fontSize: 12 }}>http://localhost:{mitmPort}</Text>
              </div>
            </div>
          )}
        </>
      )}

      <Button type="primary" block onClick={async () => {
        const config: MitmProxyConfig = {
          enabled: mitmEnabled,
          port: mitmPort,
          caInstalled: mitmCaInstalled,
          systemProxy: mitmSystemProxy,
        }
        await window.electronAPI.saveMitmProxyConfig(config)
        message.success('MITM 代理设置已保存')
        const status = await window.electronAPI.getMitmProxyStatus()
        setMitmRunning(status.running)
        setMitmCaInitialized(status.caInitialized)
      }}>
        保存 MITM 代理设置
      </Button>
    </Space>
  )
}
