import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Tag, Card, Row, Col, Divider, Typography } from 'antd'
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { salaryStandardService } from '../../services/salaryStandardService'
import { salaryItemService } from '../../services/salaryItemService'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Title } = Typography

const SalaryStandardReview = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [originalItems, setOriginalItems] = useState([]) // 保存原始明细，用于判断是否有修改
  const [editableItems, setEditableItems] = useState([]) // 可编辑的明细
  const [action, setAction] = useState(null) // 'review' 或 'view'
  const [salaryItems, setSalaryItems] = useState([]) // 所有薪酬项目列表
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 判断项目是否有计算规则（需要自动计算）
  const isAutoCalculated = (item) => {
    if (typeof item === 'string') {
      // 兼容旧代码：如果传入的是字符串（项目名称），返回false（不再使用硬编码）
      return false
    }
    // 如果传入的是对象，检查calculationRule字段
    return item && item.calculationRule && item.calculationRule.trim() !== ''
  }

  // 解析计算规则字符串，格式：项目代码+运算符+数字，例如：S001*8 或 基本工资*8% 或 基本工资*2%+3
  const parseCalculationRule = (rule) => {
    if (!rule || !rule.trim()) {
      return null
    }
    
    // 先尝试匹配复合运算：基本工资*2%+3
    const compoundMatch = rule.match(/(.+?)([*/])(\d+(?:\.\d+)?)%([+\-])(\d+(?:\.\d+)?)/)
    if (compoundMatch) {
      const baseItemIdentifier = compoundMatch[1].trim()
      const firstOperator = compoundMatch[2] // * 或 /
      const firstValue = parseFloat(compoundMatch[3])
      const secondOperator = compoundMatch[4] // + 或 -
      const secondValue = parseFloat(compoundMatch[5])
      
      // 如果是项目名称，查找对应的项目代码
      let baseItemCode = baseItemIdentifier
      if (!baseItemIdentifier.startsWith('S')) {
        const foundItem = salaryItems.find(item => item.itemName === baseItemIdentifier)
        if (foundItem) {
          baseItemCode = foundItem.itemCode
        } else {
          baseItemCode = baseItemIdentifier
        }
      }
      
      return {
        baseItemCode,
        operator: firstOperator,
        value: firstValue,
        secondOperator: secondOperator,
        secondValue: secondValue,
        isCompound: true,
        originalIdentifier: baseItemIdentifier
      }
    }
    
    // 匹配简单运算：项目代码/名称+运算符+数字（可能带%）
    const match = rule.match(/(.+?)([+\-*/])(\d+(?:\.\d+)?)(%?)/)
    if (match) {
      const baseItemIdentifier = match[1].trim()
      const operator = match[2]
      let value = parseFloat(match[3])
      const hasPercent = match[4] === '%'
      
      // 如果是项目名称，查找对应的项目代码
      let baseItemCode = baseItemIdentifier
      if (!baseItemIdentifier.startsWith('S')) {
        const foundItem = salaryItems.find(item => item.itemName === baseItemIdentifier)
        if (foundItem) {
          baseItemCode = foundItem.itemCode
        } else {
          baseItemCode = baseItemIdentifier
        }
      }
      
      return {
        baseItemCode,
        operator,
        value,
        isCompound: false,
        originalIdentifier: baseItemIdentifier
      }
    }
    
    return null
  }

  // 根据计算规则计算金额（基于项目列表中的金额）
  const calculateByRule = (item, itemsArray) => {
    if (!isAutoCalculated(item)) {
      return null
    }
    
    const parsed = parseCalculationRule(item.calculationRule)
    if (!parsed) {
      return null
    }
    
    // 查找基础项目
    const baseItem = salaryItems.find(i => i.itemCode === parsed.baseItemCode)
    if (!baseItem) {
      return null
    }
    
    // 从itemsArray中获取基础项目的金额
    const baseItemData = itemsArray.find(i => i.itemId === baseItem.itemId)
    const baseAmount = baseItemData?.amount || 0
    if (!baseAmount || baseAmount <= 0) {
      return 0
    }
    
    const base = parseFloat(baseAmount)
    let result = 0
    
    // 处理复合运算：基本工资*2%+3
    if (parsed.isCompound) {
      // 先计算第一部分：base * value / 100 或 base / value / 100
      switch (parsed.operator) {
        case '*':
          result = base * (parsed.value / 100)
          break
        case '/':
          result = base / (parsed.value / 100)
          break
        default:
          return null
      }
      
      // 然后计算第二部分：result + secondValue 或 result - secondValue
      switch (parsed.secondOperator) {
        case '+':
          result = result + parsed.secondValue
          break
        case '-':
          result = result - parsed.secondValue
          break
        default:
          return null
      }
    } else {
      // 处理简单运算
      switch (parsed.operator) {
        case '+':
          result = base + parsed.value
          break
        case '-':
          result = base - parsed.value
          break
        case '*':
          // 乘除运算符，value是百分比
          result = base * (parsed.value / 100)
          break
        case '/':
          // 乘除运算符，value是百分比
          result = base / (parsed.value / 100)
          break
        default:
          return null
      }
    }
    
    return parseFloat(result.toFixed(2))
  }

  // 重新计算所有有计算规则的项目
  const recalculateCalculatedItems = (items) => {
    return items.map(item => {
      if (isAutoCalculated(item)) {
        const calculatedAmount = calculateByRule(item, items)
        if (calculatedAmount !== null) {
          return {
            ...item,
            amount: calculatedAmount,
            isCalculated: true
          }
        }
      }
      return item
    })
  }

  useEffect(() => {
    loadData()
    loadSalaryItems()
  }, [pagination.current, pagination.pageSize])

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

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await salaryStandardService.getPendingReviewList({
        page: pagination.current,
        size: pagination.pageSize
      })
      if (response.code === 200) {
        setData(response.data?.list || [])
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0
        }))
      } else {
        message.error(response.message || '加载数据失败')
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 合并所有薪酬项目，确保显示所有项目（包括未填写的）
  const mergeAllSalaryItems = (detail) => {
    const allItemsMap = new Map()
    
    // 先添加所有薪酬项目
    salaryItems.forEach(item => {
      allItemsMap.set(item.itemId, {
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        itemType: item.itemType,
        calculationRule: item.calculationRule,
        amount: null, // 默认没有金额
        isCalculated: false
      })
    })
    
    // 然后用标准中的项目覆盖（如果有）
    if (detail.items && detail.items.length > 0) {
      detail.items.forEach(standardItem => {
        if (allItemsMap.has(standardItem.itemId)) {
          allItemsMap.set(standardItem.itemId, {
            ...allItemsMap.get(standardItem.itemId),
            amount: standardItem.amount,
            isCalculated: standardItem.isCalculated || false
          })
        }
      })
    }
    
        // 转换为数组并按排序顺序排序
        let mergedItems = Array.from(allItemsMap.values())
          .sort((a, b) => {
            const itemA = salaryItems.find(i => i.itemId === a.itemId)
            const itemB = salaryItems.find(i => i.itemId === b.itemId)
            const sortA = itemA ? (itemA.sortOrder || 0) : 0
            const sortB = itemB ? (itemB.sortOrder || 0) : 0
            return sortA - sortB
          })
        
        // 重新计算有计算规则的项目（只计算那些已经在标准中设置的项目）
        // 注意：只重新计算那些已经在标准中设置的项目（amount不为null或isCalculated为true）
        mergedItems = mergedItems.map(item => {
          // 如果项目已经在标准中设置（有金额或标记为自动计算），才重新计算
          const hasAmount = item.amount != null && item.amount > 0
          const isCalculated = item.isCalculated === true
          
          if ((hasAmount || isCalculated) && isAutoCalculated(item)) {
            const calculatedAmount = calculateByRule(item, mergedItems)
            if (calculatedAmount !== null) {
              return {
                ...item,
                amount: calculatedAmount,
                isCalculated: true
              }
            }
          }
          return item
        })
        
        return mergedItems
  }

  const handleReview = async (record) => {
    try {
      // 获取薪酬标准详情
      const detailResponse = await salaryStandardService.getDetail(record.standardId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        
        // 合并所有薪酬项目
        const mergedItems = mergeAllSalaryItems(detail)
        
        setCurrentRecord({
          ...detail,
          items: mergedItems
        })
        setAction('review')
        // 保存原始明细和可编辑明细
        setOriginalItems(JSON.parse(JSON.stringify(mergedItems))) // 深拷贝
        setEditableItems(JSON.parse(JSON.stringify(mergedItems))) // 深拷贝
        form.resetFields()
        form.setFieldsValue({
          reviewComments: detail.reviewComments || ''
        })
        setReviewModalVisible(true)
      } else {
        message.error('获取薪酬标准详情失败')
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      message.error('获取薪酬标准详情失败')
    }
  }

  const handleView = async (record) => {
    try {
      // 获取薪酬标准详情
      const detailResponse = await salaryStandardService.getDetail(record.standardId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        
        // 合并所有薪酬项目
        const mergedItems = mergeAllSalaryItems(detail)
        
        setCurrentRecord({
          ...detail,
          items: mergedItems
        })
        setAction('view')
        setEditableItems([])
        setOriginalItems([])
        form.resetFields()
        form.setFieldsValue({
          reviewComments: detail.reviewComments || ''
        })
        setReviewModalVisible(true)
      } else {
        message.error('获取薪酬标准详情失败')
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      message.error('获取薪酬标准详情失败')
    }
  }

  // 检查明细是否有修改
  const hasItemsChanged = () => {
    if (originalItems.length !== editableItems.length) return true
    return originalItems.some((original, index) => {
      const edited = editableItems[index]
      return !edited || original.amount !== edited.amount
    })
  }

  const handleApprove = async () => {
    try {
      const values = await form.validateFields()
      
      // 如果明细有修改，先更新明细
      if (hasItemsChanged()) {
        // 重新计算所有有计算规则的项目，确保提交时数据准确
        const finalItems = recalculateCalculatedItems(editableItems)
        
        // 只提交有效的项目：
        // 1. 对于有计算规则的项目，只有isCalculated为true时才包含
        // 2. 对于没有计算规则的项目，只有金额大于0时才包含
        const validItems = finalItems
          .filter(item => {
            const salaryItem = salaryItems.find(si => si.itemId === item.itemId)
            if (!salaryItem) return false
            
            // 如果有计算规则，只有isCalculated为true时才包含
            if (salaryItem.calculationRule && salaryItem.calculationRule.trim() !== '') {
              return item.isCalculated === true
            }
            // 没有计算规则的项目，金额大于0时才包含
            return (item.amount || 0) > 0
          })
          .map(item => {
            // 如果有计算规则，重新计算一次确保准确性
            let amount = item.amount || 0
            if (isAutoCalculated(item)) {
              const calculatedAmount = calculateByRule(item, finalItems)
              if (calculatedAmount !== null) {
                amount = calculatedAmount
              }
            }
            
            return {
              itemId: item.itemId,
              amount: parseFloat(amount).toFixed(2),
              isCalculated: isAutoCalculated(item)
            }
          })
        
        const updateData = {
          items: validItems
        }
        const updateResponse = await salaryStandardService.update(
          currentRecord.standardId,
          updateData
        )
        if (updateResponse.code !== 200) {
          message.error(updateResponse.message || '更新薪酬项目明细失败')
          return
        }
      }
      
      // 提交复核通过
      const response = await salaryStandardService.approveReview(
        currentRecord.standardId,
        values.reviewComments || ''
      )
      
      if (response.code === 200) {
        message.success('复核通过')
        setReviewModalVisible(false)
        form.resetFields()
        setEditableItems([])
        setOriginalItems([])
        loadData()
      } else {
        message.error(response.message || '操作失败')
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleReject = async () => {
    try {
      const values = await form.validateFields()
      
      // 如果明细有修改，先更新明细
      if (hasItemsChanged()) {
        // 重新计算所有有计算规则的项目，确保提交时数据准确
        const finalItems = recalculateCalculatedItems(editableItems)
        
        // 只提交有效的项目：
        // 1. 对于有计算规则的项目，只有isCalculated为true时才包含
        // 2. 对于没有计算规则的项目，只有金额大于0时才包含
        const validItems = finalItems
          .filter(item => {
            const salaryItem = salaryItems.find(si => si.itemId === item.itemId)
            if (!salaryItem) return false
            
            // 如果有计算规则，只有isCalculated为true时才包含
            if (salaryItem.calculationRule && salaryItem.calculationRule.trim() !== '') {
              return item.isCalculated === true
            }
            // 没有计算规则的项目，金额大于0时才包含
            return (item.amount || 0) > 0
          })
          .map(item => {
            // 如果有计算规则，重新计算一次确保准确性
            let amount = item.amount || 0
            if (isAutoCalculated(item)) {
              const calculatedAmount = calculateByRule(item, finalItems)
              if (calculatedAmount !== null) {
                amount = calculatedAmount
              }
            }
            
            return {
              itemId: item.itemId,
              amount: parseFloat(amount).toFixed(2),
              isCalculated: isAutoCalculated(item)
            }
          })
        
        const updateData = {
          items: validItems
        }
        const updateResponse = await salaryStandardService.update(
          currentRecord.standardId,
          updateData
        )
        if (updateResponse.code !== 200) {
          message.error(updateResponse.message || '更新薪酬项目明细失败')
          return
        }
      }
      
      // 提交复核驳回
      const response = await salaryStandardService.rejectReview(
        currentRecord.standardId,
        values.reviewComments || '' // 复核意见作为驳回原因
      )
      
      if (response.code === 200) {
        message.success('已驳回')
        setReviewModalVisible(false)
        form.resetFields()
        setEditableItems([])
        setOriginalItems([])
        loadData()
      } else {
        message.error(response.message || '操作失败')
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }))
  }


  const columns = [
    {
      title: '薪酬标准编号',
      dataIndex: 'standardCode',
      key: 'standardCode',
      render: (text) => <a style={{ color: '#1890ff' }}>{text}</a>
    },
    {
      title: '薪酬标准名称',
      dataIndex: 'standardName',
      key: 'standardName'
    },
    {
      title: '适用职位',
      dataIndex: 'positionName',
      key: 'positionName'
    },
    {
      title: '制定人',
      dataIndex: 'formulatorName',
      key: 'formulatorName'
    },
    {
      title: '登记时间',
      dataIndex: 'registrationTime',
      key: 'registrationTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING_REVIEW': { text: '待复核', color: 'orange' },
          'APPROVED': { text: '已通过', color: 'blue' },
          'REJECTED': { text: '已驳回', color: 'red' }
        }
        const statusInfo = statusMap[status] || { text: status, color: 'default' }
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        if (record.status === 'PENDING_REVIEW') {
          return (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleReview(record)}
            >
              复核
            </Button>
          )
        } else {
          return (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              查看
            </Button>
          )
        }
      }
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
        <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
        薪酬标准复核
      </Title>

      {/* 表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="standardId"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handleTableChange
          }}
        />
      </Card>

      {/* 复核/查看模态框 */}
      <Modal
        title={action === 'review' ? '薪酬标准复核' : '薪酬标准详情'}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false)
          form.resetFields()
          setEditableItems([])
          setOriginalItems([])
        }}
        width={900}
        footer={
          action === 'review' ? (
            <Space>
              <Button onClick={() => setReviewModalVisible(false)}>
                取消
              </Button>
              <Button danger onClick={handleReject}>
                驳回
              </Button>
              <Button type="primary" onClick={handleApprove}>
                通过
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setReviewModalVisible(false)}>
              关闭
            </Button>
          )
        }
      >
        {currentRecord && (
          <Form form={form} layout="vertical">
            {/* 基本信息 */}
            <Divider orientation="left">基本信息</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="薪酬标准编号">
                  <Input value={currentRecord.standardCode} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="薪酬标准名称">
                  <Input value={currentRecord.standardName} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="适用职位">
                  <Input value={currentRecord.positionName} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="职称">
                  <Input 
                    value={
                      currentRecord.jobTitle === 'JUNIOR' ? '初级' :
                      currentRecord.jobTitle === 'INTERMEDIATE' ? '中级' :
                      currentRecord.jobTitle === 'SENIOR' ? '高级' : currentRecord.jobTitle
                    } 
                    disabled 
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="制定人">
                  <Input value={currentRecord.formulatorName || '-'} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="登记时间">
                  <Input 
                    value={currentRecord.registrationTime ? dayjs(currentRecord.registrationTime).format('YYYY-MM-DD HH:mm') : '-'} 
                    disabled 
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 薪酬项目明细 */}
            {(action === 'review' ? editableItems : currentRecord.items) && 
             (action === 'review' ? editableItems : currentRecord.items).length > 0 && (
              <>
                <Divider orientation="left">薪酬项目明细</Divider>
                <Table
                  dataSource={action === 'review' ? editableItems : currentRecord.items}
                  rowKey={(record, index) => `${record.itemId}-${index}`}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: '项目编号',
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
                      title: '金额',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amount, record, index) => {
                        if (action === 'review' && !isAutoCalculated(record)) {
                          // 复核模式下，非自动计算的项可编辑
                          return (
                            <InputNumber
                              style={{ width: '100%' }}
                              value={amount}
                              min={0}
                              precision={2}
                              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/¥\s?|(,*)/g, '')}
                              onChange={(value) => {
                                const newItems = [...editableItems]
                                newItems[index].amount = value || 0
                                
                                // 重新计算所有有计算规则的项目
                                const recalculatedItems = recalculateCalculatedItems(newItems)
                                setEditableItems(recalculatedItems)
                              }}
                            />
                          )
                        } else {
                          // 查看模式或自动计算的项，只显示
                          return amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
                        }
                      }
                    }
                  ]}
                />
              </>
            )}

            {/* 复核意见 */}
            <Divider orientation="left">复核意见</Divider>
            <Form.Item
              name="reviewComments"
              label="复核意见"
              rules={action === 'review' ? [] : []}
            >
              <TextArea 
                rows={8} 
                placeholder={action === 'review' ? '请输入复核意见（可选）' : '暂无复核意见'} 
                disabled={action === 'view'}
                style={{ fontSize: '14px' }}
              />
            </Form.Item>

            {/* 复核信息（如果已复核） */}
            {currentRecord.reviewerName && (
              <>
                <Divider orientation="left">复核信息</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="复核人">
                      <Input value={currentRecord.reviewerName} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="复核时间">
                      <Input 
                        value={currentRecord.reviewTime ? dayjs(currentRecord.reviewTime).format('YYYY-MM-DD HH:mm') : '-'} 
                        disabled 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="状态">
                      <Tag 
                        color={
                          currentRecord.status === 'APPROVED' ? 'green' :
                          currentRecord.status === 'REJECTED' ? 'red' : 'orange'
                        }
                      >
                        {
                          currentRecord.status === 'APPROVED' ? '已通过' :
                          currentRecord.status === 'REJECTED' ? '已驳回' : '待复核'
                        }
                      </Tag>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default SalaryStandardReview
