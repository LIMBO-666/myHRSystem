import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag } from 'antd'
import { DeleteOutlined, UndoOutlined, SearchOutlined } from '@ant-design/icons'
import { employeeArchiveService } from '../../services/employeeArchiveService'
import dayjs from 'dayjs'

const { TextArea } = Input

const ArchiveDelete = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (params = {}) => {
    setLoading(true)
    try {
      const values = queryForm.getFieldsValue()
      const hasFrontendFilter = values.archiveNumber || values.name
      
      let allData = []
      
      if (values.status) {
        // 如果指定了状态，只查询该状态
        if (values.status === 'DELETED') {
          // 已删除状态使用专门的接口
          const queryParams = hasFrontendFilter 
            ? { page: 1, size: 10000, ...params }
            : { page: pagination.current, size: pagination.pageSize, ...params }
          
          const response = await employeeArchiveService.getDeletedList(queryParams)
          if (response.code === 200) {
            allData = response.data?.list || []
          }
        } else {
          // 正常和待复核状态使用query接口（会自动排除已删除）
          const queryParams = hasFrontendFilter 
            ? { page: 1, size: 10000, status: values.status, ...params }
            : { page: pagination.current, size: pagination.pageSize, status: values.status, ...params }
          
          const response = await employeeArchiveService.query(queryParams)
          if (response.code === 200) {
            allData = response.data?.list || []
          }
        }
      } else {
        // 如果没有指定状态，查询所有状态（正常、待复核、已删除）
        const normalStatuses = ['NORMAL', 'PENDING_REVIEW']
        const queryPromises = normalStatuses.map(status => {
          const queryParams = { page: 1, size: 10000, status, ...params }
          return employeeArchiveService.query(queryParams)
        })
        // 已删除状态使用专门的接口
        const deletedQueryParams = { page: 1, size: 10000, ...params }
        queryPromises.push(employeeArchiveService.getDeletedList(deletedQueryParams))
        
        const responses = await Promise.all(queryPromises)
        responses.forEach(response => {
          if (response.code === 200 && response.data?.list) {
            allData.push(...response.data.list)
          }
        })
      }
      
      // 前端过滤：按档案编号和姓名
      if (values.archiveNumber) {
        allData = allData.filter(item => 
          item.archiveNumber && item.archiveNumber.includes(values.archiveNumber)
        )
      }
      if (values.name) {
        allData = allData.filter(item => 
          item.name && item.name.includes(values.name)
        )
      }
      
      // 按登记时间倒序排序
      allData.sort((a, b) => {
        const timeA = new Date(a.registrationTime || 0).getTime()
        const timeB = new Date(b.registrationTime || 0).getTime()
        return timeB - timeA
      })
      
      // 分页处理
      const start = (pagination.current - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      const paginatedData = allData.slice(start, end)
      
      setData(paginatedData)
      setPagination({
        ...pagination,
        total: allData.length
      })
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    loadData()
  }

  const handleReset = () => {
    queryForm.resetFields()
    setPagination({ ...pagination, current: 1 })
    loadData()
  }

  const handleTableChange = (newPagination, filters, sorter) => {
    // 从newPagination对象中获取页码和每页数量
    let page, size
    if (typeof newPagination === 'object' && newPagination !== null) {
      page = Number(newPagination.current) || pagination.current
      size = Number(newPagination.pageSize) || pagination.pageSize
    } else if (typeof newPagination === 'number') {
      page = newPagination
      size = pagination.pageSize
    } else {
      page = pagination.current
      size = pagination.pageSize
    }
    
    page = page > 0 ? page : 1
    size = size > 0 ? size : 10
    
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: size
    }))
    
    loadData()
  }

  const handleDelete = (record) => {
    if (record.status === 'PENDING_REVIEW') {
      message.warning('待复核状态的档案不能删除')
      return
    }
    if (record.status === 'DELETED') {
      message.warning('该档案已删除')
      return
    }
    setCurrentRecord(record)
    form.resetFields()
    setDeleteModalVisible(true)
  }

  const handleDeleteSubmit = async () => {
    try {
      const values = await form.validateFields()
      const response = await employeeArchiveService.delete(
        currentRecord.archiveId,
        values.deleteReason
      )
      if (response.code === 200) {
        message.success('删除成功')
        setDeleteModalVisible(false)
        form.resetFields()
        setCurrentRecord(null)
        loadData()
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败：' + (error.message || '未知错误'))
    }
  }

  const handleRestore = async (archiveId) => {
    try {
      const response = await employeeArchiveService.restore(archiveId)
      if (response.code === 200) {
        message.success('恢复成功')
        loadData()
      } else {
        message.error(response.message || '恢复失败')
      }
    } catch (error) {
      message.error('恢复失败：' + (error.message || '未知错误'))
    }
  }

  const getStatusText = (status) => {
    const map = {
      'PENDING_REVIEW': '待复核',
      'NORMAL': '正常',
      'DELETED': '已删除'
    }
    return map[status] || status
  }

  const getStatusColor = (status) => {
    const map = {
      'PENDING_REVIEW': 'orange',
      'NORMAL': 'green',
      'DELETED': 'red'
    }
    return map[status] || 'default'
  }

  const columns = [
    {
      title: '档案编号',
      dataIndex: 'archiveNumber',
      key: 'archiveNumber'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '删除时间',
      dataIndex: 'deleteTime',
      key: 'deleteTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '删除原因',
      dataIndex: 'deleteReason',
      key: 'deleteReason',
      render: (reason) => reason || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'NORMAL' && (
            <Popconfirm
              title="确定要删除该档案吗？"
              description="删除后档案状态将变为'已删除'，可以在删除管理页面恢复。"
              onConfirm={() => handleDelete(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
          {record.status === 'DELETED' && (
            <Popconfirm
              title="确定要恢复该档案吗？"
              description="恢复后档案状态将变为'正常'。"
              onConfirm={() => handleRestore(record.archiveId)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" style={{ color: '#52c41a' }} icon={<UndoOutlined />}>
                恢复
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={queryForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="archiveNumber" label="档案编号">
          <Input placeholder="请输入档案编号" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="name" label="姓名">
          <Input placeholder="请输入姓名" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" style={{ width: 150 }} allowClear>
            <Select.Option value="NORMAL">正常</Select.Option>
            <Select.Option value="DELETED">已删除</Select.Option>
            <Select.Option value="PENDING_REVIEW">待复核</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="archiveId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            handleTableChange({ current: page, pageSize: pageSize })
          }
        }}
      />

      <Modal
        title="删除员工档案"
        open={deleteModalVisible}
        onOk={handleDeleteSubmit}
        onCancel={() => {
          setDeleteModalVisible(false)
          form.resetFields()
          setCurrentRecord(null)
        }}
        okText="确认删除"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="deleteReason"
            label="删除原因"
            rules={[{ required: true, message: '请输入删除原因' }]}
          >
            <TextArea rows={4} placeholder="请输入删除原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ArchiveDelete
