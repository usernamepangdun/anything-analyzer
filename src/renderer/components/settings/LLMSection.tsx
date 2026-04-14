import { useEffect } from 'react'
import { Form, Input, Select, InputNumber, Button, message } from 'antd'
import type { LLMProviderConfig, LLMProviderType, OpenAIApiType } from '@shared/types'

const defaultUrls: Record<LLMProviderType, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  custom: ''
}

export default function LLMSection() {
  const [form] = Form.useForm()
  const providerValue = Form.useWatch('name', form)
  const showApiType = providerValue === 'openai' || providerValue === 'custom'

  useEffect(() => {
    window.electronAPI.getLLMConfig().then(config => {
      if (config) form.setFieldsValue(config)
    })
  }, [form])

  const handleProviderChange = (value: LLMProviderType) => {
    form.setFieldValue('baseUrl', defaultUrls[value])
    if (value === 'anthropic') {
      form.setFieldValue('apiType', undefined)
    } else if (!form.getFieldValue('apiType')) {
      form.setFieldValue('apiType', 'completions')
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    await window.electronAPI.saveLLMConfig(values as LLMProviderConfig)
    message.success('LLM 配置已保存')
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ name: 'openai', baseUrl: defaultUrls.openai, maxTokens: 4096, apiType: 'completions' as OpenAIApiType }}
    >
      <Form.Item name="name" label="Provider" rules={[{ required: true }]}>
        <Select onChange={handleProviderChange} options={[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
          { label: 'Custom (OpenAI Compatible)', value: 'custom' }
        ]} />
      </Form.Item>
      {showApiType && (
        <Form.Item name="apiType" label="API Type">
          <Select options={[
            { label: 'Chat Completions (/chat/completions)', value: 'completions' },
            { label: 'Responses (/responses)', value: 'responses' }
          ]} />
        </Form.Item>
      )}
      <Form.Item name="baseUrl" label="Base URL" rules={[{ required: true }]}>
        <Input placeholder="https://api.openai.com/v1" />
      </Form.Item>
      <Form.Item name="apiKey" label="API Key" rules={[{ required: true }]}>
        <Input.Password placeholder="sk-..." />
      </Form.Item>
      <Form.Item name="model" label="Model" rules={[{ required: true }]}>
        <Input placeholder="gpt-4o / claude-sonnet-4-20250514 / ..." />
      </Form.Item>
      <Form.Item name="maxTokens" label="Max Tokens">
        <InputNumber min={256} max={128000} style={{ width: '100%' }} />
      </Form.Item>
      <Button type="primary" block onClick={handleSave}>
        保存 LLM 配置
      </Button>
    </Form>
  )
}
