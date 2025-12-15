import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Table, message, Card, Space, Checkbox } from 'antd'
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { salaryStandardService } from '../../services/salaryStandardService'
import { salaryItemService } from '../../services/salaryItemService'
import { Modal } from 'antd'

const SalaryStandardUpdate = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [searchForm] = Form.useForm()
  const [salaryItems, setSalaryItems] = useState([])
  const [items, setItems] = useState([])
  const [standardId, setStandardId] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    loadSalaryItems()
  }, [])

  const loadSalaryItems = async () => {
    try {
      const response = await salaryItemService.getList()
      if (response.code === 200) {
        setSalaryItems(response.data || [])
      }
    } catch (error) {
      console.error('加载薪酬项目失败:', error)
    }
  }

  const handleSearch = async () => {
    const values = searchForm.getFieldsValue()
    if (!values.standardCode) {
      message.warning('请输入标准编号')
      return
    }
    
    setLoading(true)
    try {
      // 这里需要通过标准编号查询标准详情
      // 假设有一个通过编号查询的接口，如果没有需要先查询列表再过滤
      const queryResponse = await salaryStandardService.query({
        standardCode: values.standardCode
      })
      
      if (queryResponse.code === 200 && queryResponse.data?.list?.length > 0) {
        const standard = queryResponse.data.list[0]
        if (standard.status !== 'APPROVED') {
          message.warning('只能变更已通过的标准')
          return
        }
        
        const detailResponse = await salaryStandardService.getDetail(standard.standardId)
        if (detailResponse.code === 200) {
          const detail = detailResponse.data
          setStandardId(detail.standardId)
          form.setFieldsValue({
            standardName: detail.standardName
          })
          setItems(detail.items || [])
          setModalVisible(true)
        }
      } else {
        message.warning('未找到该标准')
      }
    } catch (error) {
      message.error('查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { itemId: null, amount: 0, isCalculated: false, included: false }])
  }

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 只提交有效的项目（itemId不为空，且金额大于0或标记为自动计算）
      const validItems = items
        .filter(item => item.itemId != null) // 过滤掉未选择项目的行
        .filter(item => {
          // 对于有计算规则的项目，如果isCalculated为true，则包含
          const salaryItem = salaryItems.find(si => si.itemId === item.itemId)
          if (salaryItem && salaryItem.calculationRule && salaryItem.calculationRule.trim() !== '') {
            // 有计算规则的项目，只有isCalculated为true时才包含
            return item.isCalculated === true
          }
          // 没有计算规则的项目，金额大于0时才包含
          return (item.amount || 0) > 0
        })
        .map(item => ({
          itemId: item.itemId,
          amount: item.amount || 0,
          isCalculated: item.isCalculated || false
        }))
      
      const submitData = {
        standardName: values.standardName,
        items: validItems
      }
      
      const response = await salaryStandardService.update(standardId, submitData)
      if (response.code === 200) {
        message.success('变更成功，等待复核')
        setModalVisible(false)
        searchForm.resetFields()
      } else {
        message.error(response.message || '变更失败')
      }
    } catch (error) {
      message.error('变更失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  // 判断项目是否有计算规则
  const isAutoCalculated = (itemId) => {
    const salaryItem = salaryItems.find(si => si.itemId === itemId)
    return salaryItem && salaryItem.calculationRule && salaryItem.calculationRule.trim() !== ''
  }

  const itemColumns = [
    {
      title: '薪酬项目',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (itemId, record, index) => {
        const salaryItem = salaryItems.find(si => si.itemId === itemId)
        const hasCalculationRule = salaryItem && salaryItem.calculationRule && salaryItem.calculationRule.trim() !== ''
        return (
          <div>
            <Select
              style={{ width: '100%' }}
              value={itemId}
              onChange={(value) => {
                const newItems = [...items]
                const selectedSalaryItem = salaryItems.find(si => si.itemId === value)
                newItems[index].itemId = value
                // 如果新选择的项目有计算规则，默认包含
                if (selectedSalaryItem && selectedSalaryItem.calculationRule && selectedSalaryItem.calculationRule.trim() !== '') {
                  newItems[index].included = true
                  newItems[index].isCalculated = true
                } else {
                  newItems[index].included = false
                  newItems[index].isCalculated = false
                }
                setItems(newItems)
              }}
            >
              {salaryItems.map(item => (
                <Select.Option key={item.itemId} value={item.itemId}>
                  {item.itemName}
                  {item.calculationRule && (
                    <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                      (自动计算)
                    </span>
                  )}
                </Select.Option>
              ))}
            </Select>
            {hasCalculationRule && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                计算规则: {salaryItem.calculationRule}
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record, index) => {
        const hasCalculationRule = isAutoCalculated(record.itemId)
        return (
          <Input
            type="number"
            value={amount}
            disabled={hasCalculationRule && record.isCalculated}
            onChange={(e) => {
              const newItems = [...items]
              newItems[index].amount = parseFloat(e.target.value) || 0
              setItems(newItems)
            }}
          />
        )
      }
    },
    {
      title: '包含',
      key: 'included',
      width: 100,
      render: (_, record, index) => {
        const hasCalculationRule = isAutoCalculated(record.itemId)
        if (!hasCalculationRule) {
          // 没有计算规则的项目，根据金额判断是否包含
          return (record.amount || 0) > 0 ? '是' : '否'
        }
        // 有计算规则的项目，显示复选框
        return (
          <Checkbox
            checked={record.included !== false}
            onChange={(e) => {
              const newItems = [...items]
              newItems[index].included = e.target.checked
              newItems[index].isCalculated = e.target.checked
              if (!e.target.checked) {
                newItems[index].amount = 0
              }
              setItems(newItems)
            }}
          >
            包含
          </Checkbox>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, __, index) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        >
          删除
        </Button>
      )
    }
  ]

  return (
    <Card title="薪酬标准变更">
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item
          name="standardCode"
          label="标准编号"
          rules={[{ required: true, message: '请输入标准编号' }]}
        >
          <Input placeholder="请输入标准编号" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="变更薪酬标准"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="standardName"
            label="标准名称"
            rules={[{ required: true, message: '请输入标准名称' }]}
          >
            <Input />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Space>
              <span>薪酬项目明细：</span>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                添加项目
              </Button>
            </Space>
          </div>

          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey={(_, index) => index}
            pagination={false}
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>
    </Card>
  )
}

export default SalaryStandardUpdate

