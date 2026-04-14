import { useEffect } from 'react'
import { Form, Input, Select, InputNumber, Button, message } from 'antd'
import type { ProxyConfig } from '@shared/types'

export default function ProxySection() {
  const [proxyForm] = Form.useForm()
  const proxyType = Form.useWatch('type', proxyForm)

  useEffect(() => {
    window.electronAPI.getProxyConfig().then(config => {
      if (config) proxyForm.setFieldsValue(config)
    })
  }, [proxyForm])

  return (
    <>
      <Form
        form={proxyForm}
        layout="vertical"
        initialValues={{ type: 'none' as ProxyConfig['type'], host: '', port: 1080 }}
      >
        <Form.Item name="type" label="代理类型">
          <Select options={[
            { label: '无代理 (直连)', value: 'none' },
            { label: 'HTTP', value: 'http' },
            { label: 'HTTPS', value: 'https' },
            { label: 'SOCKS5', value: 'socks5' },
          ]} />
        </Form.Item>
        {proxyType && proxyType !== 'none' && (
          <>
            <Form.Item name="host" label="主机" rules={[{ required: true, message: '请输入代理主机' }]}>
              <Input placeholder="127.0.0.1" />
            </Form.Item>
            <Form.Item name="port" label="端口" rules={[{ required: true, message: '请输入端口' }]}>
              <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="1080" />
            </Form.Item>
            <Form.Item name="username" label="用户名（可选）">
              <Input placeholder="留空则无认证" />
            </Form.Item>
            <Form.Item name="password" label="密码（可选）">
              <Input.Password placeholder="留空则无认证" />
            </Form.Item>
          </>
        )}
      </Form>
      <Button type="primary" block onClick={async () => {
        const values = await proxyForm.validateFields()
        await window.electronAPI.saveProxyConfig(values as ProxyConfig)
        message.success('代理设置已保存并生效')
      }}>
        保存代理设置
      </Button>
    </>
  )
}
