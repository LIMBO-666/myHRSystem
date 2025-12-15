import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, InputNumber, message, Card, Row, Col, Space, Checkbox } from 'antd'
import { useAuth } from '../../contexts/AuthContext'
import { salaryStandardService } from '../../services/salaryStandardService'
import { positionService } from '../../services/positionService'
import { salaryItemService } from '../../services/salaryItemService'
import { userService } from '../../services/userService'
import dayjs from 'dayjs'

const SalaryStandardRegister = () => {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [positions, setPositions] = useState([])
  const [salaryItems, setSalaryItems] = useState([])
  const [users, setUsers] = useState([])
  const [standardCode, setStandardCode] = useState('') // 薪酬标准编号（系统生成）
  const [registrationTime, setRegistrationTime] = useState(dayjs().format('YYYY-MM-DD HH:mm')) // 登记时间
  const [includedItems, setIncludedItems] = useState({}) // 记录哪些有计算规则的项目被包含

  useEffect(() => {
    loadPositions()
    loadSalaryItems()
    loadUsers()
    // 设置默认登记人为当前登录用户
    if (user?.userId) {
      form.setFieldsValue({ registrarId: user.userId })
    }
  }, [user])

  const loadPositions = async () => {
    try {
      const response = await positionService.getList()
      if (response.code === 200) {
        setPositions(response.data || [])
      } else {
        message.warning(response.message || '加载职位失败')
      }
    } catch (error) {
      console.error('加载职位失败:', error)
      if (error.response?.status === 403) {
        message.error('权限不足，无法加载职位列表')
      } else {
        message.error('加载职位失败，请稍后重试')
      }
    }
  }

  const loadSalaryItems = async () => {
    try {
      const response = await salaryItemService.getList()
      if (response.code === 200) {
        // 按排序顺序排序
        const sortedItems = (response.data || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setSalaryItems(sortedItems)
      } else {
        message.warning(response.message || '加载薪酬项目失败')
      }
    } catch (error) {
      console.error('加载薪酬项目失败:', error)
      if (error.response?.status === 403) {
        message.error('权限不足，无法加载薪酬项目列表')
      } else {
        message.error('加载薪酬项目失败，请稍后重试')
      }
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userService.getList()
      if (response.code === 200) {
        setUsers(response.data || [])
      } else {
        message.warning(response.message || '加载用户列表失败')
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
      message.error('加载用户列表失败，请稍后重试')
    }
  }

  // 判断项目是否有计算规则（需要自动计算）
  const isAutoCalculated = (item) => {
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

  // 根据计算规则计算金额
  const calculateByRule = (item, formValues) => {
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
    
    // 获取基础项目的金额
    const baseAmount = formValues[`item_${baseItem.itemId}`] || 0
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

  // 获取指定项目的金额
  const getItemAmount = (itemCode) => {
    const values = form.getFieldsValue()
    const item = salaryItems.find(i => i.itemCode === itemCode)
    if (item) {
      return values[`item_${item.itemId}`] || 0
    }
    return 0
  }

  // 处理任何项目变化，自动计算有计算规则的项目
  const handleItemChange = (changedItemCode) => {
    const formValues = form.getFieldsValue()
    const updates = {}
    
    // 遍历所有有计算规则的项目
    salaryItems.forEach(item => {
      if (isAutoCalculated(item)) {
        const calculatedAmount = calculateByRule(item, formValues)
        if (calculatedAmount !== null) {
          updates[`item_${item.itemId}`] = calculatedAmount
        }
      }
    })
    
    // 批量更新表单值
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 构建薪酬项目明细列表
      // 对于有计算规则的项目，只有用户选择"包含此项目"时才提交
      const items = salaryItems
        .filter(item => {
          // 如果有计算规则，检查用户是否选择包含此项目
          if (isAutoCalculated(item)) {
            return includedItems[item.itemId] !== false // 默认包含，除非明确取消
          }
          // 没有计算规则的项目，如果金额大于0就包含
          const amount = values[`item_${item.itemId}`] || 0
          return parseFloat(amount) > 0
        })
        .map(item => {
          let amount = values[`item_${item.itemId}`] || 0
          
          // 如果有计算规则，重新计算一次确保准确性
          if (isAutoCalculated(item)) {
            const calculatedAmount = calculateByRule(item, values)
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

      const submitData = {
        standardName: values.standardName,
        positionId: values.positionId,
        jobTitle: values.jobTitle,
        formulatorId: values.formulatorId,
        registrarId: values.registrarId,
        items: items
      }
      
      const response = await salaryStandardService.create(submitData)
      if (response.code === 200) {
        message.success('登记成功')
        // 显示生成的薪酬标准编号
        if (response.data?.standardCode) {
          setStandardCode(response.data.standardCode)
        }
        form.resetFields()
        // 重置后重新设置默认值
        if (user?.userId) {
          form.setFieldsValue({ registrarId: user.userId })
        }
        setRegistrationTime(dayjs().format('YYYY-MM-DD HH:mm'))
      } else {
        message.error(response.message || '登记失败')
      }
    } catch (error) {
      console.error('登记失败:', error)
      message.error('登记失败：' + (error.response?.data?.message || error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    setIncludedItems({}) // 重置包含项目状态
    setStandardCode('')
    setRegistrationTime(dayjs().format('YYYY-MM-DD HH:mm'))
    if (user?.userId) {
      form.setFieldsValue({ registrarId: user.userId })
    }
  }

  return (
    <Card title="薪酬标准登记">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          registrarId: user?.userId
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="薪酬标准编号">
              <Input value={standardCode} placeholder="提交后自动生成" disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="standardName"
              label="薪酬标准名称"
              rules={[{ required: true, message: '请输入薪酬标准名称' }]}
            >
              <Input placeholder="例如：软件工程师-中级标准" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="formulatorId"
              label="制定人"
              rules={[{ required: true, message: '请选择制定人' }]}
            >
              <Select placeholder="请选择制定人" showSearch optionFilterProp="children">
                {users.map(u => (
                  <Select.Option key={u.userId} value={u.userId}>
                    {u.realName || u.username}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="registrarId"
              label="登记人"
              rules={[{ required: true, message: '请选择登记人' }]}
            >
              <Select placeholder="请选择登记人" showSearch optionFilterProp="children">
                {users.map(u => (
                  <Select.Option key={u.userId} value={u.userId}>
                    {u.realName || u.username}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="登记时间">
              <Input value={registrationTime} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="positionId"
              label="适用职位"
              rules={[{ required: true, message: '请选择职位' }]}
            >
              <Select placeholder="请选择职位">
                {positions.map(pos => (
                  <Select.Option key={pos.positionId} value={pos.positionId}>
                    {pos.positionName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="jobTitle"
              label="职称"
              rules={[{ required: true, message: '请选择职称' }]}
            >
              <Select placeholder="请选择职称">
                <Select.Option value="JUNIOR">初级</Select.Option>
                <Select.Option value="INTERMEDIATE">中级</Select.Option>
                <Select.Option value="SENIOR">高级</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <h3>选择薪酬项目</h3>
        </div>

        <Row gutter={16}>
          {salaryItems.map(item => {
            const isAutoCalc = isAutoCalculated(item)
            const fieldName = `item_${item.itemId}`
            
            // 格式化计算规则显示
            const formatCalculationRule = () => {
              if (!isAutoCalc) return ''
              
              const parsed = parseCalculationRule(item.calculationRule)
              if (!parsed) return item.calculationRule
              
              const baseItem = salaryItems.find(i => i.itemCode === parsed.baseItemCode)
              const baseItemName = baseItem ? baseItem.itemName : parsed.baseItemCode
              
              const operatorMap = {
                '+': '+',
                '-': '-',
                '*': '×',
                '/': '÷'
              }
              const operator = operatorMap[parsed.operator] || parsed.operator
              
              // 如果是乘除，显示百分比
              if (parsed.operator === '*' || parsed.operator === '/') {
                return `计算方式: ${baseItemName} ${operator} ${parsed.value}%`
              } else {
                return `计算方式: ${baseItemName} ${operator} ${parsed.value}`
              }
            }
            
            return (
              <Col span={8} key={item.itemId} style={{ marginBottom: 16 }}>
                <Form.Item
                  name={fieldName}
                  label={
                    <span>
                      {item.itemName}
                      {isAutoCalc && (
                        <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                          (自动计算)
                        </span>
                      )}
                    </span>
                  }
                  initialValue={0}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    placeholder="请输入金额"
                    disabled={isAutoCalc}
                    onChange={(value) => {
                      // 当任何项目变化时，重新计算所有有计算规则的项目
                      handleItemChange(item.itemCode)
                    }}
                    formatter={value => value ? `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={value => value.replace(/¥\s?|(,*)/g, '')}
                  />
                </Form.Item>
                {isAutoCalc && (
                  <>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: -16, marginBottom: 4 }}>
                      {formatCalculationRule()}
                    </div>
                    <Checkbox
                      checked={includedItems[item.itemId] !== false}
                      onChange={(e) => {
                        setIncludedItems({
                          ...includedItems,
                          [item.itemId]: e.target.checked
                        })
                        // 如果取消选择，将金额设为0
                        if (!e.target.checked) {
                          form.setFieldsValue({ [fieldName]: 0 })
                        } else {
                          // 如果选择，重新计算金额
                          handleItemChange(item.itemCode)
                        }
                      }}
                      style={{ fontSize: '12px', marginBottom: 8 }}
                    >
                      包含此项目
                    </Checkbox>
                  </>
                )}
              </Col>
            )
          })}
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button onClick={handleReset}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default SalaryStandardRegister
