import React, { useMemo, useCallback, useRef } from 'react'
import { Table, Tag } from 'antd'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import type { CapturedRequest } from '@shared/types'

interface RequestLogProps {
  requests: CapturedRequest[]
  selectedId: string | null
  onSelect: (request: CapturedRequest) => void
  selectedSeqs: number[]
  onSelectedSeqsChange: (seqs: number[]) => void
}

// Color mapping for HTTP methods
const METHOD_COLORS: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'cyan',
  HEAD: 'default',
  OPTIONS: 'default'
}

// Color for status codes
function getStatusColor(code: number | null): string {
  if (code === null) return 'default'
  if (code >= 200 && code < 300) return 'green'
  if (code >= 300 && code < 400) return 'blue'
  if (code >= 400 && code < 500) return 'gold'
  if (code >= 500) return 'red'
  return 'default'
}

// Extract path portion from a full URL
function extractPath(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname + parsed.search
  } catch {
    return url
  }
}

// Extract host (domain + port) from a full URL
function extractHost(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.host
  } catch {
    return url
  }
}

const RequestLog: React.FC<RequestLogProps> = ({ requests, selectedId, onSelect, selectedSeqs, onSelectedSeqsChange }) => {
  // Track open filter dropdown count — hide native browser view while any is open
  const openFilterCount = useRef(0)
  const handleFilterDropdownOpenChange = useCallback((open: boolean) => {
    openFilterCount.current += open ? 1 : -1
    window.electronAPI.setTargetViewVisible(openFilterCount.current <= 0)
  }, [])
  // Collect unique domains from current requests for filter dropdown
  const domainFilters = useMemo(() => {
    const hosts = new Set<string>()
    for (const r of requests) {
      hosts.add(extractHost(r.url))
    }
    return Array.from(hosts).sort().map(h => ({ text: h, value: h }))
  }, [requests])

  const columns: ColumnsType<CapturedRequest> = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'sequence',
        key: 'sequence',
        width: 60,
        sorter: (a, b) => a.sequence - b.sequence
      },
      {
        title: 'Source',
        dataIndex: 'source',
        key: 'source',
        width: 70,
        render: (source: string | undefined) =>
          source === 'proxy'
            ? <Tag color="green">代理</Tag>
            : <Tag color="blue">浏览器</Tag>,
        filters: [
          { text: '浏览器', value: 'cdp' },
          { text: '代理', value: 'proxy' },
        ],
        onFilter: (value, record) =>
          (record.source || 'cdp') === (value as string),
        onFilterDropdownOpenChange: handleFilterDropdownOpenChange,
      },
      {
        title: 'Method',
        dataIndex: 'method',
        key: 'method',
        width: 90,
        render: (method: string) => (
          <Tag color={METHOD_COLORS[method.toUpperCase()] || 'default'}>
            {method.toUpperCase()}
          </Tag>
        ),
        filters: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({
          text: m,
          value: m
        })),
        onFilter: (value, record) =>
          record.method.toUpperCase() === (value as string),
        onFilterDropdownOpenChange: handleFilterDropdownOpenChange,
      },
      {
        title: 'Domain',
        key: 'domain',
        width: 160,
        ellipsis: true,
        render: (_: unknown, record: CapturedRequest) => (
          <span title={extractHost(record.url)} style={{ fontSize: 12, color: '#8c8c8c' }}>
            {extractHost(record.url)}
          </span>
        ),
        filters: domainFilters,
        filterSearch: (input, record) =>
          (record.value as string).toLowerCase().includes(input.toLowerCase()),
        onFilter: (value, record) =>
          extractHost(record.url) === (value as string),
        onFilterDropdownOpenChange: handleFilterDropdownOpenChange,
      },
      {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
        ellipsis: true,
        render: (_url: string, record: CapturedRequest) => (
          <span title={record.url}>
            {record.is_streaming ? <Tag color="orange" style={{ marginRight: 4 }}>SSE</Tag> : null}
            {record.is_websocket ? <Tag color="purple" style={{ marginRight: 4 }}>WS</Tag> : null}
            {extractPath(record.url)}
          </span>
        )
      },
      {
        title: 'Status',
        dataIndex: 'status_code',
        key: 'status_code',
        width: 80,
        render: (code: number | null) =>
          code !== null ? (
            <Tag color={getStatusColor(code)}>{code}</Tag>
          ) : (
            <Tag color="default">--</Tag>
          ),
        sorter: (a, b) => (a.status_code ?? 0) - (b.status_code ?? 0)
      },
      {
        title: 'Duration',
        dataIndex: 'duration_ms',
        key: 'duration_ms',
        width: 100,
        render: (ms: number | null) =>
          ms !== null ? `${ms} ms` : '--',
        sorter: (a, b) => (a.duration_ms ?? 0) - (b.duration_ms ?? 0)
      }
    ],
    [domainFilters]
  )

  const handleRow = useCallback(
    (record: CapturedRequest) => ({
      onClick: () => onSelect(record),
      style: {
        cursor: 'pointer',
        background: record.id === selectedId ? 'rgba(22, 119, 255, 0.15)' : undefined
      }
    }),
    [selectedId, onSelect]
  )

  // 多选配置：使用 sequence 作为选择键
  const rowSelection: TableRowSelection<CapturedRequest> = useMemo(
    () => ({
      selectedRowKeys: selectedSeqs,
      onChange: (_selectedKeys: React.Key[], selectedRows: CapturedRequest[]) => {
        onSelectedSeqsChange(selectedRows.map(r => r.sequence))
      },
      columnWidth: 40,
    }),
    [selectedSeqs, onSelectedSeqsChange]
  )

  return (
    <Table<CapturedRequest>
      columns={columns}
      dataSource={requests}
      rowKey="sequence"
      rowSelection={rowSelection}
      size="small"
      pagination={false}
      scroll={{ y: 400 }}
      virtual
      onRow={handleRow}
      rowClassName={(record) =>
        record.id === selectedId ? 'ant-table-row-selected' : ''
      }
      locale={{ emptyText: 'No requests captured yet' }}
    />
  )
}

export default RequestLog
