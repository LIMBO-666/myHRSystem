import React, { useState, useEffect } from 'react'
import { Table, Button, message, Card, Typography, InputNumber, Space, Tag, DatePicker } from 'antd'
import { DollarOutlined, EditOutlined, ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons'
import { salaryIssuanceService } from '../../services/salaryIssuanceService'
import { salaryItemService } from '../../services/salaryItemService'
import dayjs from 'dayjs'
import './SalaryIssuanceRegister.css'

const { Title } = Typography

const SalaryIssuanceRegister = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState([])
  const [salaryItems, setSalaryItems] = useState([]) // 所有薪酬项目列表
  const [selectedMonth, setSelectedMonth] = useState(dayjs()) // 选中的月份，默认为当前月份
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadData()
    loadSalaryItems()
  }, [selectedMonth])

  const loadSalaryItems = async () => {
    try {
      const response = await salaryItemService.getList()
      if (response.code === 200) {
        // 按排序顺序排序
        const sortedItems = (response.data || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setSalaryItems(sortedItems)
      }
    } catch (error) {
      console.error('加载薪酬项目失败:', error)
    }
  }

  const [allData, setAllData] = useState([]) // 存储所有数据

  const loadData = async () => {
    setLoading(true)
    try {
      // 使用选中的月份查询
      const issuanceMonth = selectedMonth ? selectedMonth.format('YYYY-MM') : null
      const response = await salaryIssuanceService.getPendingRegistrationList({ issuanceMonth })
      if (response.code === 200) {
        const fullData = response.data || []
        setAllData(fullData)
        // 更新分页总数
        setPagination(prev => ({
          ...prev,
          total: fullData.length,
          current: 1 // 重置到第一页
        }))
        // 更新当前页数据
        updatePageData(fullData, 1, pagination.pageSize)
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

  // 更新当前页数据
  const updatePageData = (fullData, page, pageSize) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const pageData = fullData.slice(start, end)
    setData(pageData)
  }

  // 处理分页变化
  const handleTableChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }))
    updatePageData(allData, page, pageSize)
  }

  const handleRegister = async (record) => {
    setLoading(true)
    try {
      // 获取用于登记的员工明细列表
      // 使用记录的月份，如果没有则使用当前月份
      const issuanceMonth = record.issuanceMonth 
        ? dayjs(record.issuanceMonth).format('YYYY-MM')
        : dayjs().format('YYYY-MM')
      const response = await salaryIssuanceService.getRegistrationDetails(record.thirdOrgId, issuanceMonth)
      
      if (response.code !== 200 || !response.data) {
        message.error(response.message || '获取员工明细失败')
        return
      }

      const details = response.data.map(detail => ({
        employeeId: detail.employeeId,
        employeeNumber: detail.employeeNumber,
        employeeName: detail.employeeName,
        positionName: detail.positionName,
        basicSalary: parseFloat(detail.basicSalary) || 0,
        performanceBonus: parseFloat(detail.performanceBonus) || 0,
        transportationAllowance: parseFloat(detail.transportationAllowance) || 0,
        mealAllowance: parseFloat(detail.mealAllowance) || 0,
        pensionInsurance: detail.pensionInsurance != null ? parseFloat(detail.pensionInsurance) : null,
        medicalInsurance: detail.medicalInsurance != null ? parseFloat(detail.medicalInsurance) : null,
        unemploymentInsurance: detail.unemploymentInsurance != null ? parseFloat(detail.unemploymentInsurance) : null,
        housingFund: detail.housingFund != null ? parseFloat(detail.housingFund) : null,
        awardAmount: parseFloat(detail.awardAmount) || 0,
        deductionAmount: parseFloat(detail.deductionAmount) || 0,
        totalIncome: parseFloat(detail.totalIncome) || 0,
        totalDeduction: parseFloat(detail.totalDeduction) || 0,
        netPay: parseFloat(detail.netPay) || 0,
        dynamicItems: detail.dynamicItems || {} // 动态薪酬项目
      }))
      
      if (details.length === 0) {
        message.warning('该机构下没有符合条件的员工')
        return
      }

      setEmployeeDetails(details)
      setCurrentRecord(record)
      setShowDetail(true)
    } catch (error) {
      console.error('加载员工明细失败:', error)
      message.error('加载员工明细失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  // 计算保险和公积金金额
  const calculateInsuranceAmount = (itemCode, basicSalary) => {
    if (!basicSalary || basicSalary <= 0) {
      return 0
    }
    const base = parseFloat(basicSalary)
    switch (itemCode) {
      case 'S006': // 养老保险 = 基本工资 * 8%
        return base * 0.08
      case 'S007': // 医疗保险 = 基本工资 * 2% + 3元
        return base * 0.02 + 3
      case 'S008': // 失业保险 = 基本工资 * 0.5%
        return base * 0.005
      case 'S009': // 住房公积金 = 基本工资 * 8%
        return base * 0.08
      default:
        return 0
    }
  }

  // 获取保险或公积金金额（只有后端明确返回了值才显示，不自动计算）
  const getInsuranceAmount = (detail, field, itemCode) => {
    const value = detail[field]
    // 只有后端明确返回了值（不为null且大于0）才返回，否则返回null表示不显示
    if (value != null && parseFloat(value) > 0) {
      return parseFloat(value)
    }
    return null // 返回null表示不显示，不自动计算
  }

  const calculateTotals = (detail) => {
    // 总收入 = 基本工资 + 绩效奖金 + 交通补贴 + 餐费补贴 + 奖励金额 + 动态收入项目
    let totalIncome = 
      (detail.basicSalary || 0) +
      (detail.performanceBonus || 0) +
      (detail.transportationAllowance || 0) +
      (detail.mealAllowance || 0) +
      (detail.awardAmount || 0)
    
    // 累加动态收入项目
    if (detail.dynamicItems) {
      Object.keys(detail.dynamicItems).forEach(itemCode => {
        const item = salaryItems.find(i => i.itemCode === itemCode)
        if (item && item.itemType === 'INCOME') {
          totalIncome += parseFloat(detail.dynamicItems[itemCode]) || 0
        }
      })
    }
    
    detail.totalIncome = totalIncome

    // 获取保险和公积金金额（只有后端明确返回了值才参与计算）
    const pensionInsurance = getInsuranceAmount(detail, 'pensionInsurance', 'S006') || 0
    const medicalInsurance = getInsuranceAmount(detail, 'medicalInsurance', 'S007') || 0
    const unemploymentInsurance = getInsuranceAmount(detail, 'unemploymentInsurance', 'S008') || 0
    const housingFund = getInsuranceAmount(detail, 'housingFund', 'S009') || 0

    // 总扣除 = 养老保险 + 医疗保险 + 失业保险 + 住房公积金 + 应扣金额 + 动态扣除项目
    // 注意：只有后端明确返回了值的项目才参与计算
    let totalDeduction =
      pensionInsurance +
      medicalInsurance +
      unemploymentInsurance +
      housingFund +
      (detail.deductionAmount || 0)
    
    // 累加动态扣除项目
    if (detail.dynamicItems) {
      Object.keys(detail.dynamicItems).forEach(itemCode => {
        const item = salaryItems.find(i => i.itemCode === itemCode)
        if (item && item.itemType === 'DEDUCTION') {
          totalDeduction += parseFloat(detail.dynamicItems[itemCode]) || 0
        }
      })
    }
    
    detail.totalDeduction = totalDeduction

    // 实发金额 = 总收入 - 总扣除
    detail.netPay = detail.totalIncome - detail.totalDeduction
  }

  const handleAmountChange = (index, field, value) => {
    const newDetails = [...employeeDetails]
    newDetails[index][field] = value || 0
    calculateTotals(newDetails[index])
    setEmployeeDetails(newDetails)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 使用记录的月份，如果没有则使用当前月份
      const issuanceMonth = currentRecord.issuanceMonth 
        ? dayjs(currentRecord.issuanceMonth).format('YYYY-MM')
        : dayjs().format('YYYY-MM')
      
      const submitData = {
        thirdOrgId: currentRecord.thirdOrgId,
        issuanceMonth: issuanceMonth,
        details: employeeDetails.map(detail => ({
          employeeId: detail.employeeId,
          awardAmount: detail.awardAmount || 0,
          deductionAmount: detail.deductionAmount || 0
        }))
      }
      
      const response = await salaryIssuanceService.create(submitData)
      if (response.code === 200) {
        message.success('登记成功')
        setShowDetail(false)
        setCurrentRecord(null)
        setEmployeeDetails([])
        loadData()
      } else {
        message.error(response.message || '登记失败')
      }
    } catch (error) {
      console.error('登记失败:', error)
      message.error('登记失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '薪酬单号',
      dataIndex: 'salarySlipNumber',
      key: 'salarySlipNumber',
      render: (text) => text ? <a style={{ color: '#1890ff' }}>{text}</a> : '-'
    },
    {
      title: '发放月份',
      dataIndex: 'issuanceMonth',
      key: 'issuanceMonth',
      width: 120,
      render: (date) => {
        if (!date) return '-'
        return dayjs(date).format('YYYY-MM')
      }
    },
    {
      title: '机构名称',
      dataIndex: 'orgFullPath',
      key: 'orgFullPath'
    },
    {
      title: '总人数',
      dataIndex: 'totalEmployees',
      key: 'totalEmployees'
    },
    {
      title: '基本薪酬总额',
      dataIndex: 'totalBasicSalary',
      key: 'totalBasicSalary',
      render: (amount) => amount ? `¥${parseFloat(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING_REGISTRATION': '待登记',
          'PENDING_REVIEW': '待复核'
        }
        const colorMap = {
          'PENDING_REGISTRATION': 'blue',
          'PENDING_REVIEW': 'orange'
        }
        return <Tag color={colorMap[status]}>{statusMap[status] || status}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleRegister(record)}
        >
          登记
        </Button>
      )
    }
  ]

  // 构建动态表格列（包括固定列和动态列）
  const buildDetailColumns = () => {
    const fixedColumns = [
    {
      title: '员工编号',
      dataIndex: 'employeeNumber',
      key: 'employeeNumber',
      width: 100
    },
    {
      title: '姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 120
    },
    {
      title: '基本工资',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      width: 120,
      render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
    },
    {
      title: '绩效奖金',
      dataIndex: 'performanceBonus',
      key: 'performanceBonus',
      width: 120,
      render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
    },
    {
      title: '交通补贴',
      dataIndex: 'transportationAllowance',
      key: 'transportationAllowance',
      width: 120,
      render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
    },
    {
      title: '餐费补贴',
      dataIndex: 'mealAllowance',
      key: 'mealAllowance',
      width: 120,
      render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
    }
    ]

    // 获取发放月份，用于过滤薪酬项目
    const issuanceMonth = currentRecord?.issuanceMonth 
      ? dayjs(currentRecord.issuanceMonth)
      : selectedMonth
    const nextMonthStart = issuanceMonth ? issuanceMonth.add(1, 'month').startOf('month') : null

    // 添加动态收入项目列（排除已映射的固定字段）
    // 只显示在发放月份之前创建的薪酬项目，并且至少有一个员工有该项目
    const fixedIncomeCodes = ['S001', 'S002', 'S003', 'S004']
    
    // 收集所有员工中出现的动态收入项目代码
    const existingIncomeItemCodes = new Set()
    employeeDetails.forEach(detail => {
      if (detail.dynamicItems) {
        Object.keys(detail.dynamicItems).forEach(itemCode => {
          const item = salaryItems.find(i => i.itemCode === itemCode)
          if (item && item.itemType === 'INCOME' && !fixedIncomeCodes.includes(itemCode)) {
            existingIncomeItemCodes.add(itemCode)
          }
        })
      }
    })
    
    const dynamicIncomeColumns = salaryItems
      .filter(item => {
        // 过滤固定字段
        if (item.itemType !== 'INCOME' || fixedIncomeCodes.includes(item.itemCode)) {
          return false
        }
        // 只显示至少有一个员工有的项目
        if (!existingIncomeItemCodes.has(item.itemCode)) {
          return false
        }
        // 如果指定了发放月份，只显示在该月份之前创建的薪酬项目
        if (nextMonthStart && item.createTime) {
          const itemCreateTime = dayjs(item.createTime)
          return itemCreateTime.isBefore(nextMonthStart)
        }
        return true
      })
      .map(item => {
        return {
          title: item.itemName,
          key: `dynamic_${item.itemCode}`,
          width: 120,
          render: (_, record) => {
            const amount = record.dynamicItems?.[item.itemCode] || 0
            return amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
          }
        }
      })

    const fixedDeductionColumns = [
      {
        title: '养老保险',
        dataIndex: 'pensionInsurance',
        key: 'pensionInsurance',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'pensionInsurance', 'S006')
          return value != null && value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      },
      {
        title: '医疗保险',
        dataIndex: 'medicalInsurance',
        key: 'medicalInsurance',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'medicalInsurance', 'S007')
          return value != null && value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      },
      {
        title: '失业保险',
        dataIndex: 'unemploymentInsurance',
        key: 'unemploymentInsurance',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'unemploymentInsurance', 'S008')
          return value != null && value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      },
      {
        title: '住房公积金',
        dataIndex: 'housingFund',
        key: 'housingFund',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'housingFund', 'S009')
          return value != null && value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      }
    ]

    // 添加动态扣除项目列（排除已映射的固定字段）
    // 只显示在发放月份之前创建的薪酬项目，并且至少有一个员工有该项目
    const fixedDeductionCodes = ['S006', 'S007', 'S008', 'S009']
    
    // 收集所有员工中出现的动态扣除项目代码
    const existingDeductionItemCodes = new Set()
    employeeDetails.forEach(detail => {
      if (detail.dynamicItems) {
        Object.keys(detail.dynamicItems).forEach(itemCode => {
          const item = salaryItems.find(i => i.itemCode === itemCode)
          if (item && item.itemType === 'DEDUCTION' && !fixedDeductionCodes.includes(itemCode)) {
            existingDeductionItemCodes.add(itemCode)
          }
        })
      }
    })
    
    const dynamicDeductionColumns = salaryItems
      .filter(item => {
        // 过滤固定字段
        if (item.itemType !== 'DEDUCTION' || fixedDeductionCodes.includes(item.itemCode)) {
          return false
        }
        // 只显示至少有一个员工有的项目
        if (!existingDeductionItemCodes.has(item.itemCode)) {
          return false
        }
        // 如果指定了发放月份，只显示在该月份之前创建的薪酬项目
        if (nextMonthStart && item.createTime) {
          const itemCreateTime = dayjs(item.createTime)
          return itemCreateTime.isBefore(nextMonthStart)
        }
        return true
      })
      .map(item => {
        return {
          title: item.itemName,
          key: `dynamic_${item.itemCode}`,
          width: 120,
          render: (_, record) => {
            const amount = record.dynamicItems?.[item.itemCode] || 0
            return amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
          }
        }
      })

    const otherColumns = [
      {
        title: '奖励金额',
      dataIndex: 'awardAmount',
      key: 'awardAmount',
      width: 150,
      render: (amount, record, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={amount}
          min={0}
          precision={2}
          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/¥\s?|(,*)/g, '')}
          onChange={(value) => handleAmountChange(index, 'awardAmount', value)}
        />
      )
    },
    {
      title: '应扣金额',
      dataIndex: 'deductionAmount',
      key: 'deductionAmount',
      width: 150,
      render: (amount, record, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={amount}
          min={0}
          precision={2}
          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/¥\s?|(,*)/g, '')}
          onChange={(value) => handleAmountChange(index, 'deductionAmount', value)}
        />
      )
    },
    {
      title: '实发金额',
      dataIndex: 'netPay',
      key: 'netPay',
      width: 120,
      render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
    }
    ]

    return [
      ...fixedColumns,
      ...dynamicIncomeColumns,
      ...fixedDeductionColumns,
      ...dynamicDeductionColumns,
      ...otherColumns
    ]
  }

  const detailColumns = buildDetailColumns()

  // 计算总计
  const calculateTotal = (field) => {
    return employeeDetails.reduce((sum, detail) => {
      if (field === 'pensionInsurance') {
        return sum + (getInsuranceAmount(detail, 'pensionInsurance', 'S006') || 0)
      } else if (field === 'medicalInsurance') {
        return sum + (getInsuranceAmount(detail, 'medicalInsurance', 'S007') || 0)
      } else if (field === 'unemploymentInsurance') {
        return sum + (getInsuranceAmount(detail, 'unemploymentInsurance', 'S008') || 0)
      } else if (field === 'housingFund') {
        return sum + (getInsuranceAmount(detail, 'housingFund', 'S009') || 0)
      } else {
        return sum + (parseFloat(detail[field]) || 0)
      }
    }, 0)
  }

  // 总计行数据
  const totalRow = {
    employeeNumber: '总计',
    employeeName: '-',
    positionName: '',
    basicSalary: calculateTotal('basicSalary'),
    performanceBonus: calculateTotal('performanceBonus'),
    transportationAllowance: calculateTotal('transportationAllowance'),
    mealAllowance: calculateTotal('mealAllowance'),
    pensionInsurance: calculateTotal('pensionInsurance'),
    medicalInsurance: calculateTotal('medicalInsurance'),
    unemploymentInsurance: calculateTotal('unemploymentInsurance'),
    housingFund: calculateTotal('housingFund'),
    awardAmount: calculateTotal('awardAmount'),
    deductionAmount: calculateTotal('deductionAmount'),
    netPay: calculateTotal('netPay')
  }

  if (showDetail) {
    return (
      <div style={{ padding: '24px' }}>
        {/* 页面标题 */}
        <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
          <DollarOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
          薪酬发放登记
        </Title>

        {/* 详情表格 */}
        <Card>
          <Table
            columns={detailColumns}
            dataSource={[...employeeDetails, totalRow]}
            rowKey={(record, index) => record.employeeId || `total-${index}`}
            pagination={false}
            scroll={{ x: 1500 }}
            loading={loading}
            rowClassName={(record, index) => {
              if (index === employeeDetails.length) {
                return 'total-row'
              }
              return ''
            }}
          />
        </Card>

        {/* 操作按钮 */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                setShowDetail(false)
                setCurrentRecord(null)
                setEmployeeDetails([])
              }}
            >
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              提交薪酬发放登记
            </Button>
          </Space>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
        <DollarOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
        薪酬发放登记
      </Title>

      {/* 月份选择器 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space>
          <span style={{ fontWeight: 500 }}>选择月份：</span>
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(date) => {
              setSelectedMonth(date || dayjs())
            }}
            format="YYYY-MM"
            placeholder="选择月份"
            allowClear={false}
          />
          <Button
            type="primary"
            onClick={() => {
              setSelectedMonth(dayjs())
            }}
          >
            当前月份
          </Button>
        </Space>
      </Card>

      {/* 列表表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="thirdOrgId"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange
          }}
        />
      </Card>
    </div>
  )
}

export default SalaryIssuanceRegister
