import React, { useState, useEffect } from 'react'
import { Table, Form, Input, InputNumber, Select, DatePicker, Button, message, Tag, Card, Row, Col, Typography, Modal, Divider, Space } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { salaryStandardService } from '../../services/salaryStandardService'
import { salaryItemService } from '../../services/salaryItemService'
import { useAuth } from '../../contexts/AuthContext'
import dayjs from 'dayjs'

const { Title } = Typography

const SalaryStandardQuery = () => {
  const { hasRole } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [updateForm] = Form.useForm()
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [editableItems, setEditableItems] = useState([])
  const [salaryItems, setSalaryItems] = useState([])
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
  const calculateByRule = (item, itemsMap) => {
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
    
    // 从itemsMap中获取基础项目的金额
    const baseItemData = itemsMap.get(baseItem.itemId)
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

  // 根据计算规则计算金额（基于项目数组）
  const calculateByRuleFromArray = (item, itemsArray) => {
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
        const calculatedAmount = calculateByRuleFromArray(item, items)
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
    loadSalaryItems() // 所有角色都需要加载薪酬项目列表，用于详情显示
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

  const loadData = async (params = {}) => {
    setLoading(true)
    try {
      // 确保page和size都是有效的数字
      const page = params.page !== undefined && params.page !== null ? Number(params.page) : pagination.current
      const size = params.size !== undefined && params.size !== null ? Number(params.size) : pagination.pageSize
      
      const queryParams = {
        ...params,
        page: page > 0 ? page : 1,
        size: size > 0 ? size : 10
      }
      
      // 调试信息
      console.log('查询参数:', queryParams)
      
      const response = await salaryStandardService.query(queryParams)
      if (response.code === 200) {
        console.log('查询结果:', {
          total: response.data?.total,
          listLength: response.data?.list?.length,
          currentPage: queryParams.page
        })
        
        setData(response.data?.list || [])
        setPagination(prev => ({
          ...prev,
          current: queryParams.page,
          pageSize: queryParams.size,
          total: response.data?.total || 0
        }))
      } else {
        message.error(response.message || '查询失败')
      }
    } catch (error) {
      console.error('查询失败:', error)
      console.error('错误详情:', error.response?.data)
      if (error.response?.status === 403) {
        message.error('权限不足，无法查询薪酬标准')
      } else {
        message.error('查询失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    
    // 薪酬标准编号（模糊查询）
    if (values.standardCode && values.standardCode.trim()) {
      params.standardCode = values.standardCode.trim()
    }
    
    // 关键字（模糊查询，在薪酬标准名称、制定人、变更人、复核人字段匹配）
    if (values.keyword && values.keyword.trim()) {
      params.keyword = values.keyword.trim()
    }
    
    // 登记起始日期
    if (values.startDate) {
      params.startDate = values.startDate.format('YYYY-MM-DD')
    }
    
    // 登记结束日期
    if (values.endDate) {
      params.endDate = values.endDate.format('YYYY-MM-DD')
    }
    
    // 重置到第一页
    setPagination(prev => ({ ...prev, current: 1 }))
    loadData(params)
  }

  const handleTableChange = (newPagination, filters, sorter) => {
    console.log('handleTableChange 被调用:', newPagination)
    
    const values = form.getFieldsValue()
    const params = {}
    
    // 保持查询条件
    if (values.standardCode && values.standardCode.trim()) {
      params.standardCode = values.standardCode.trim()
    }
    if (values.keyword && values.keyword.trim()) {
      params.keyword = values.keyword.trim()
    }
    if (values.startDate) {
      params.startDate = values.startDate.format('YYYY-MM-DD')
    }
    if (values.endDate) {
      params.endDate = values.endDate.format('YYYY-MM-DD')
    }
    
    // 从newPagination对象中获取页码和每页数量
    // 注意：Ant Design Table的onChange可能传递的是页码数字，而不是对象
    let page, size
    if (typeof newPagination === 'object' && newPagination !== null) {
      page = Number(newPagination.current) || pagination.current
      size = Number(newPagination.pageSize) || pagination.pageSize
    } else if (typeof newPagination === 'number') {
      // 如果直接传递的是页码数字
      page = newPagination
      size = pagination.pageSize
    } else {
      // 如果参数格式不对，使用当前分页状态
      page = pagination.current
      size = pagination.pageSize
    }
    
    // 确保页码和每页数量都是有效数字
    page = page > 0 ? page : 1
    size = size > 0 ? size : 10
    
    console.log('准备加载数据 - 页码:', page, '每页:', size)
    
    // 先更新分页状态
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: size
    }))
    
    // 然后加载数据
    loadData({
      ...params,
      page: page,
      size: size
    })
  }


  const handleView = async (record) => {
    try {
      // 获取薪酬标准详情
      const detailResponse = await salaryStandardService.getDetail(record.standardId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        
        // 只显示在标准中实际包含的项目
        // 对于有计算规则的项目，只有isCalculated为true时才包含
        // 对于没有计算规则的项目，只有金额大于0时才包含
        let mergedItems = []
        
        if (detail.items && detail.items.length > 0) {
          // 过滤出有效的项目
          mergedItems = detail.items
            .filter(standardItem => {
              const salaryItem = salaryItems.find(si => si.itemId === standardItem.itemId)
              if (!salaryItem) return false
              
              // 如果有计算规则，只有isCalculated为true时才包含
              if (salaryItem.calculationRule && salaryItem.calculationRule.trim() !== '') {
                return standardItem.isCalculated === true
              }
              // 没有计算规则的项目，金额大于0时才包含
              return (standardItem.amount || 0) > 0
            })
            .map(standardItem => {
              const salaryItem = salaryItems.find(si => si.itemId === standardItem.itemId)
              return {
                itemId: standardItem.itemId,
                itemCode: salaryItem.itemCode,
                itemName: salaryItem.itemName,
                itemType: salaryItem.itemType,
                calculationRule: salaryItem.calculationRule,
                amount: standardItem.amount,
                isCalculated: standardItem.isCalculated || false
              }
            })
          
          // 按排序顺序排序
          mergedItems = mergedItems.sort((a, b) => {
            const itemA = salaryItems.find(i => i.itemId === a.itemId)
            const itemB = salaryItems.find(i => i.itemId === b.itemId)
            const sortA = itemA ? (itemA.sortOrder || 0) : 0
            const sortB = itemB ? (itemB.sortOrder || 0) : 0
            return sortA - sortB
          })
          
          // 重新计算有计算规则的项目（只计算那些已经在标准中设置的项目）
          // 创建Map用于计算规则，key为itemId，value为包含amount的对象
          const allItemAmountsMap = new Map()
          mergedItems.forEach(mergedItem => {
            allItemAmountsMap.set(mergedItem.itemId, {
              amount: mergedItem.amount || 0
            })
          })
          
          mergedItems = mergedItems.map(item => {
            if (isAutoCalculated(item) && item.isCalculated) {
              const calculatedAmount = calculateByRule(item, allItemAmountsMap)
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
        
        setCurrentRecord({
          ...detail,
          items: mergedItems
        })
        setViewModalVisible(true)
      } else {
        message.error('获取薪酬标准详情失败')
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      message.error('获取薪酬标准详情失败')
    }
  }

  const handleUpdate = async (record) => {
    // 只能变更待复核或已驳回的标准
    if (record.status !== 'PENDING_REVIEW' && record.status !== 'REJECTED') {
      message.warning('只能变更待复核或已驳回的标准')
      return
    }
    
    try {
      // 获取薪酬标准详情
      const detailResponse = await salaryStandardService.getDetail(record.standardId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        
        // 合并所有薪酬项目，确保显示所有项目（包括未填写的）
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
        
        // 重新计算有计算规则的项目
        mergedItems = recalculateCalculatedItems(mergedItems)
        
        setCurrentRecord(detail)
        setEditableItems(JSON.parse(JSON.stringify(mergedItems))) // 深拷贝
        updateForm.resetFields()
        updateForm.setFieldsValue({
          standardName: detail.standardName
        })
        setUpdateModalVisible(true)
      } else {
        message.error('获取薪酬标准详情失败')
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      message.error('获取薪酬标准详情失败')
    }
  }

  const handleUpdateSubmit = async () => {
    try {
      const values = await updateForm.validateFields()
      const submitData = {
        standardName: values.standardName,
        items: editableItems.map(item => {
          // 如果有计算规则，重新计算一次确保准确性
          let amount = item.amount || 0
          if (isAutoCalculated(item)) {
            const calculatedAmount = calculateByRuleFromArray(item, editableItems)
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
      }
      
      const response = await salaryStandardService.update(currentRecord.standardId, submitData)
      if (response.code === 200) {
        message.success('变更成功，等待复核')
        setUpdateModalVisible(false)
        updateForm.resetFields()
        setEditableItems([])
        setCurrentRecord(null)
        // 重新加载数据
        const formValues = form.getFieldsValue()
        const params = {}
        if (formValues.standardCode && formValues.standardCode.trim()) {
          params.standardCode = formValues.standardCode.trim()
        }
        if (formValues.keyword && formValues.keyword.trim()) {
          params.keyword = formValues.keyword.trim()
        }
        if (formValues.startDate) {
          params.startDate = formValues.startDate.format('YYYY-MM-DD')
        }
        if (formValues.endDate) {
          params.endDate = formValues.endDate.format('YYYY-MM-DD')
        }
        loadData(params)
      } else {
        message.error(response.message || '变更失败')
      }
    } catch (error) {
      console.error('变更失败:', error)
      message.error('变更失败：' + (error.message || '未知错误'))
    }
  }

  const columns = [
    {
      title: '标准编号',
      dataIndex: 'standardCode',
      key: 'standardCode'
    },
    {
      title: '标准名称',
      dataIndex: 'standardName',
      key: 'standardName'
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName'
    },
    {
      title: '职称',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (title) => {
        const titleMap = {
          'JUNIOR': '初级',
          'INTERMEDIATE': '中级',
          'SENIOR': '高级'
        }
        return titleMap[title] || title
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING_REVIEW': '待复核',
          'APPROVED': '已通过',
          'REJECTED': '已驳回'
        }
        const colorMap = {
          'PENDING_REVIEW': 'orange',
          'APPROVED': 'green',
          'REJECTED': 'red'
        }
        return <Tag color={colorMap[status]}>{statusMap[status] || status}</Tag>
      }
    },
    {
      title: '登记时间',
      dataIndex: 'registrationTime',
      key: 'registrationTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {hasRole(['SALARY_SPECIALIST']) && (record.status === 'PENDING_REVIEW' || record.status === 'REJECTED') && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
            >
              变更
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
        <SearchOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
        薪酬标准查询
      </Title>

      {/* 查询表单 */}
      <Card style={{ marginBottom: '16px' }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="standardCode" label="薪酬标准编号">
                <Input placeholder="输入薪酬标准编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="keyword" label="关键字">
                <Input placeholder="输入关键字" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="登记起始日期">
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  placeholder="年/月/日"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="登记结束日期">
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  placeholder="年/月/日"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 结果表格 */}
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
            onChange: (page, pageSize) => {
              console.log('分页onChange被调用:', { page, pageSize })
              handleTableChange({ current: page, pageSize: pageSize })
            }
          }}
        />
      </Card>

      {/* 查看模态框 */}
      <Modal
        title="薪酬标准详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false)
          setCurrentRecord(null)
        }}
        width={900}
        footer={
          <Button onClick={() => {
            setViewModalVisible(false)
            setCurrentRecord(null)
          }}>
            关闭
          </Button>
        }
      >
        {currentRecord && (
          <div>
            {/* 基本信息 */}
            <Divider orientation="left">基本信息</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#666', marginBottom: '4px' }}>薪酬标准编号</div>
                  <div>{currentRecord.standardCode}</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#666', marginBottom: '4px' }}>薪酬标准名称</div>
                  <div>{currentRecord.standardName}</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#666', marginBottom: '4px' }}>适用职位</div>
                  <div>{currentRecord.positionName}</div>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#666', marginBottom: '4px' }}>职称</div>
                  <div>
                    {
                      currentRecord.jobTitle === 'JUNIOR' ? '初级' :
                      currentRecord.jobTitle === 'INTERMEDIATE' ? '中级' :
                      currentRecord.jobTitle === 'SENIOR' ? '高级' : currentRecord.jobTitle
                    }
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#666', marginBottom: '4px' }}>制定人</div>
                  <div>{currentRecord.formulatorName || '-'}</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#666', marginBottom: '4px' }}>登记时间</div>
                  <div>
                    {currentRecord.registrationTime ? dayjs(currentRecord.registrationTime).format('YYYY-MM-DD HH:mm') : '-'}
                  </div>
                </div>
              </Col>
            </Row>

            {/* 薪酬项目明细 */}
            {currentRecord.items && currentRecord.items.length > 0 && (
              <>
                <Divider orientation="left">薪酬项目明细</Divider>
                <Table
                  dataSource={currentRecord.items}
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
                      render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
                    }
                  ]}
                />
              </>
            )}

            {/* 复核信息（如果已复核） */}
            {currentRecord.reviewerName && (
              <>
                <Divider orientation="left">复核信息</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#666', marginBottom: '4px' }}>复核人</div>
                      <div>{currentRecord.reviewerName}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#666', marginBottom: '4px' }}>复核时间</div>
                      <div>
                        {currentRecord.reviewTime ? dayjs(currentRecord.reviewTime).format('YYYY-MM-DD HH:mm') : '-'}
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#666', marginBottom: '4px' }}>状态</div>
                      <div>
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
                      </div>
                    </div>
                  </Col>
                </Row>
                {currentRecord.reviewComments && (
                  <Row gutter={16}>
                    <Col span={24}>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ color: '#666', marginBottom: '4px' }}>复核意见</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{currentRecord.reviewComments}</div>
                      </div>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 变更模态框 */}
      <Modal
        title="变更薪酬标准"
        open={updateModalVisible}
        onOk={handleUpdateSubmit}
        onCancel={() => {
          setUpdateModalVisible(false)
          updateForm.resetFields()
          setEditableItems([])
          setCurrentRecord(null)
        }}
        width={900}
        okText="提交变更"
        cancelText="取消"
      >
        {currentRecord && (
          <Form form={updateForm} layout="vertical">
            {/* 基本信息 */}
            <Divider orientation="left">基本信息</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="薪酬标准编号">
                  <Input value={currentRecord.standardCode} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="standardName"
                  label="薪酬标准名称"
                  rules={[{ required: true, message: '请输入薪酬标准名称' }]}
                >
                  <Input />
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
            {editableItems && editableItems.length > 0 && (
              <>
                <Divider orientation="left">薪酬项目明细</Divider>
                <Table
                  dataSource={editableItems}
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
                        if (isAutoCalculated(record)) {
                          // 自动计算的项，只显示
                          return amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
                        } else {
                          // 非自动计算的项，可编辑
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
                        }
                      }
                    }
                  ]}
                />
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default SalaryStandardQuery
