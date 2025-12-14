import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { salaryItemService } from '../../services/salaryItemService'

const SalaryItem = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  const [calculationOperator, setCalculationOperator] = useState(null) // 运算符

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await salaryItemService.getList()
      if (response.code === 200) {
        setData(response.data || [])
      }
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取下一个可用的排序值
  const getNextAvailableSortOrder = () => {
    if (data.length === 0) {
      return 1
    }
    const maxSortOrder = Math.max(...data.map(item => item.sortOrder || 0))
    return maxSortOrder + 1
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setCalculationOperator(null)
    // 自动填充下一个可用的排序值
    form.setFieldsValue({ sortOrder: getNextAvailableSortOrder() })
    setModalVisible(true)
  }

  // 解析计算规则字符串
  const parseCalculationRule = (rule) => {
    if (!rule || !rule.trim()) {
      return { baseItemCode: null, operator: null, value: null }
    }
    
    // 尝试解析格式：项目代码+运算符+数字 或 项目名称+运算符+数字
    // 例如：S001*8 或 基本工资*8%
    const match = rule.match(/(.+?)([+\-*/])(\d+(?:\.\d+)?)/)
    if (match) {
      const baseItem = match[1].trim()
      const operator = match[2]
      const value = parseFloat(match[3])
      
      // 查找项目代码或项目名称
      const item = data.find(i => i.itemCode === baseItem || i.itemName === baseItem)
      
      return {
        baseItemCode: item ? item.itemCode : null,
        operator: operator,
        value: value
      }
    }
    
    return { baseItemCode: null, operator: null, value: null }
  }

  // 格式化计算规则显示
  const formatCalculationRule = (rule) => {
    if (!rule || !rule.trim()) {
      return '-'
    }
    
    const parsed = parseCalculationRule(rule)
    if (parsed.baseItemCode && parsed.operator && parsed.value != null) {
      const item = data.find(i => i.itemCode === parsed.baseItemCode)
      const itemName = item ? item.itemName : parsed.baseItemCode
      const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷'
      }
      const operator = operatorMap[parsed.operator] || parsed.operator
      
      // 如果是乘除，显示百分比
      if (parsed.operator === '*' || parsed.operator === '/') {
        return `${itemName} ${operator} ${parsed.value}%`
      } else {
        return `${itemName} ${operator} ${parsed.value}`
      }
    }
    
    return rule
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    
    // 解析计算规则
    const parsed = parseCalculationRule(record.calculationRule)
    form.setFieldsValue({
      ...record,
      calculationBaseItemCode: parsed.baseItemCode,
      calculationOperator: parsed.operator,
      calculationValue: parsed.value
    })
    setCalculationOperator(parsed.operator)
    setModalVisible(true)
  }

  const handleDelete = async (itemId) => {
    try {
      const response = await salaryItemService.delete(itemId)
      if (response.code === 200) {
        message.success('删除成功')
        loadData()
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 验证排序值唯一性
      if (values.sortOrder != null) {
        const existingItem = data.find(item => 
          item.sortOrder === values.sortOrder && 
          item.itemId !== editingRecord?.itemId
        )
        if (existingItem) {
          message.error(`排序值 ${values.sortOrder} 已被项目"${existingItem.itemName}"使用，请使用其他排序值`)
          return
        }
      }
      
      // 构建计算规则字符串
      let calculationRule = null
      if (values.calculationBaseItemCode && values.calculationOperator && values.calculationValue != null) {
        const baseItem = data.find(i => i.itemCode === values.calculationBaseItemCode)
        if (baseItem) {
          // 格式：项目代码+运算符+数字，例如：S001*8
          calculationRule = `${baseItem.itemCode}${values.calculationOperator}${values.calculationValue}`
        }
      }
      
      // 准备提交的数据
      const submitData = {
        itemCode: values.itemCode,
        itemName: values.itemName,
        itemType: values.itemType,
        calculationRule: calculationRule,
        sortOrder: values.sortOrder
      }
      
      let response
      if (editingRecord) {
        response = await salaryItemService.update(editingRecord.itemId, submitData)
      } else {
        response = await salaryItemService.create(submitData)
      }
      
      if (response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功')
        setModalVisible(false)
        loadData()
      } else {
        message.error(response.message || '操作失败')
      }
    } catch (error) {
      console.error('表单验证失败:', error)
      if (error.response?.data?.message) {
        message.error(error.response.data.message)
      }
    }
  }

  const columns = [
    {
      title: '项目代码',
      dataIndex: 'itemCode',
      key: 'itemCode'
    },
    {
      title: '项目名称',
      dataIndex: 'itemName',
      key: 'itemName'
    },
    {
      title: '项目类型',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (type) => {
        const typeMap = {
          'INCOME': '收入',
          'DEDUCTION': '扣除'
        }
        return typeMap[type] || type
      }
    },
    {
      title: '计算规则',
      dataIndex: 'calculationRule',
      key: 'calculationRule',
      render: (rule) => formatCalculationRule(rule)
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 'ACTIVE' ? '启用' : '禁用'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.itemId)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增薪酬项目
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="itemId"
      />

      <Modal
        title={editingRecord ? '编辑薪酬项目' : '新增薪酬项目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="itemCode"
            label="项目代码"
            rules={[{ required: true, message: '请输入项目代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="itemName"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="itemType"
            label="项目类型"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select>
              <Select.Option value="INCOME">收入</Select.Option>
              <Select.Option value="DEDUCTION">扣除</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="计算规则"
            extra="可选，设置后该项目的金额将根据规则自动计算"
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="calculationBaseItemCode"
                noStyle
                rules={[
                  {
                    validator: (_, value) => {
                      const operator = form.getFieldValue('calculationOperator')
                      const calcValue = form.getFieldValue('calculationValue')
                      if (operator || calcValue != null) {
                        if (!value) {
                          return Promise.reject(new Error('请选择基础项目'))
                        }
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Select
                  placeholder="选择基础项目"
                  style={{ width: '40%' }}
                  allowClear
                  onChange={() => {
                    // 清空运算符和数值
                    if (!form.getFieldValue('calculationBaseItemCode')) {
                      form.setFieldsValue({
                        calculationOperator: null,
                        calculationValue: null
                      })
                      setCalculationOperator(null)
                    }
                  }}
                >
                  {data
                    .filter(item => item.itemId !== editingRecord?.itemId) // 排除当前编辑的项目
                    .map(item => (
                      <Select.Option key={item.itemId} value={item.itemCode}>
                        {item.itemName} ({item.itemCode})
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="calculationOperator"
                noStyle
                rules={[
                  {
                    validator: (_, value) => {
                      const baseItem = form.getFieldValue('calculationBaseItemCode')
                      const calcValue = form.getFieldValue('calculationValue')
                      if (baseItem || calcValue != null) {
                        if (!value) {
                          return Promise.reject(new Error('请选择运算符'))
                        }
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Select
                  placeholder="运算符"
                  style={{ width: '20%' }}
                  allowClear
                  onChange={(value) => {
                    setCalculationOperator(value)
                    if (!value) {
                      form.setFieldsValue({ calculationValue: null })
                    }
                  }}
                >
                  <Select.Option value="+">+</Select.Option>
                  <Select.Option value="-">-</Select.Option>
                  <Select.Option value="*">×</Select.Option>
                  <Select.Option value="/">÷</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="calculationValue"
                noStyle
                rules={[
                  {
                    validator: (_, value) => {
                      const baseItem = form.getFieldValue('calculationBaseItemCode')
                      const operator = form.getFieldValue('calculationOperator')
                      if (baseItem || operator) {
                        if (value == null || value === '') {
                          return Promise.reject(new Error('请输入数值'))
                        }
                        if (value < 0) {
                          return Promise.reject(new Error('数值不能为负数'))
                        }
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <InputNumber
                  placeholder={calculationOperator === '*' || calculationOperator === '/' ? '百分比' : '数值'}
                  style={{ width: '40%' }}
                  min={0}
                  precision={calculationOperator === '*' || calculationOperator === '/' ? 2 : 0}
                  addonAfter={calculationOperator === '*' || calculationOperator === '/' ? '%' : ''}
                  onChange={() => {
                    // 如果清空了数值，也清空其他字段
                    if (form.getFieldValue('calculationValue') == null) {
                      const baseItem = form.getFieldValue('calculationBaseItemCode')
                      const operator = form.getFieldValue('calculationOperator')
                      if (!baseItem && !operator) {
                        form.setFieldsValue({
                          calculationBaseItemCode: null,
                          calculationOperator: null
                        })
                        setCalculationOperator(null)
                      }
                    }
                  }}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            name="sortOrder"
            label="排序"
            extra={editingRecord ? '排序值必须唯一' : `建议使用 ${getNextAvailableSortOrder()}（下一个可用值）`}
            rules={[
              { required: true, message: '请输入排序值' },
              { type: 'number', min: 0, message: '排序值必须大于等于0' },
              {
                validator: (_, value) => {
                  if (value == null) {
                    return Promise.resolve()
                  }
                  // 检查排序值是否重复（排除当前编辑的项目）
                  const existingItem = data.find(item => 
                    item.sortOrder === value && 
                    item.itemId !== editingRecord?.itemId
                  )
                  if (existingItem) {
                    return Promise.reject(new Error(`排序值 ${value} 已被项目"${existingItem.itemName}"使用`))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              placeholder="请输入唯一的排序值"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SalaryItem

