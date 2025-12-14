import React, { useState, useEffect } from 'react'
import { Table, Button, message, Card, Typography, InputNumber, Space, Tag, DatePicker } from 'antd'
import { CheckCircleOutlined, EyeOutlined, ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons'
import { salaryIssuanceService } from '../../services/salaryIssuanceService'
import { salaryItemService } from '../../services/salaryItemService'
import dayjs from 'dayjs'
import './SalaryIssuanceReview.css'

const { Title } = Typography

const SalaryIssuanceReview = () => {
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
    loadData(1, 10)
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

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const issuanceMonth = selectedMonth ? selectedMonth.format('YYYY-MM') : null
      const response = await salaryIssuanceService.getPendingReviewList({
        issuanceMonth: issuanceMonth,
        page: page,
        size: pageSize
      })
      if (response.code === 200) {
        setData(response.data?.list || [])
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.data?.total || 0
        })
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

  const handleReview = async (record) => {
    setLoading(true)
    try {
      // 获取薪酬发放单详情
      const detailResponse = await salaryIssuanceService.getDetail(record.issuanceId)
      if (detailResponse.code === 200 && detailResponse.data) {
        const details = (detailResponse.data.details || []).map(detail => ({
          detailId: detail.detailId,
          employeeId: detail.employeeId,
          employeeNumber: detail.employeeNumber,
          employeeName: detail.employeeName,
          positionName: detail.positionName,
          basicSalary: parseFloat(detail.basicSalary) || 0,
          performanceBonus: parseFloat(detail.performanceBonus) || 0,
          transportationAllowance: parseFloat(detail.transportationAllowance) || 0,
          mealAllowance: parseFloat(detail.mealAllowance) || 0,
          pensionInsurance: parseFloat(detail.pensionInsurance) || 0,
          medicalInsurance: parseFloat(detail.medicalInsurance) || 0,
          unemploymentInsurance: parseFloat(detail.unemploymentInsurance) || 0,
          housingFund: parseFloat(detail.housingFund) || 0,
          awardAmount: parseFloat(detail.awardAmount) || 0,
          deductionAmount: parseFloat(detail.deductionAmount) || 0,
          totalIncome: parseFloat(detail.totalIncome) || 0,
          totalDeduction: parseFloat(detail.totalDeduction) || 0,
          netPay: parseFloat(detail.netPay) || 0,
          dynamicItems: detail.dynamicItems || {} // 动态薪酬项目
        }))
        
        setEmployeeDetails(details)
        setCurrentRecord(record)
        setShowDetail(true)
      } else {
        message.error('获取详情失败')
      }
    } catch (error) {
      console.error('加载详情失败:', error)
      message.error('加载详情失败')
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

  // 获取保险或公积金金额（如果为空则计算）
  const getInsuranceAmount = (detail, field, itemCode) => {
    const value = detail[field]
    if (value && parseFloat(value) > 0) {
      return parseFloat(value)
    }
    return calculateInsuranceAmount(itemCode, detail.basicSalary)
  }

  const calculateTotals = (detail) => {
    // 计算动态收入项目的总和
    let dynamicIncome = 0
    if (detail.dynamicItems) {
      Object.keys(detail.dynamicItems).forEach(itemCode => {
        const item = salaryItems.find(i => i.itemCode === itemCode)
        if (item && item.itemType === 'INCOME') {
          dynamicIncome += parseFloat(detail.dynamicItems[itemCode]) || 0
        }
      })
    }
    
    // 总收入 = 基本工资 + 绩效奖金 + 交通补贴 + 餐费补贴 + 奖励金额 + 动态收入项目
    detail.totalIncome = 
      (detail.basicSalary || 0) +
      (detail.performanceBonus || 0) +
      (detail.transportationAllowance || 0) +
      (detail.mealAllowance || 0) +
      (detail.awardAmount || 0) +
      dynamicIncome

    // 获取保险和公积金金额（如果为空则计算）
    const pensionInsurance = getInsuranceAmount(detail, 'pensionInsurance', 'S006')
    const medicalInsurance = getInsuranceAmount(detail, 'medicalInsurance', 'S007')
    const unemploymentInsurance = getInsuranceAmount(detail, 'unemploymentInsurance', 'S008')
    const housingFund = getInsuranceAmount(detail, 'housingFund', 'S009')

    // 计算动态扣除项目的总和
    let dynamicDeduction = 0
    if (detail.dynamicItems) {
      Object.keys(detail.dynamicItems).forEach(itemCode => {
        const item = salaryItems.find(i => i.itemCode === itemCode)
        if (item && item.itemType === 'DEDUCTION') {
          dynamicDeduction += parseFloat(detail.dynamicItems[itemCode]) || 0
        }
      })
    }

    // 总扣除 = 养老保险 + 医疗保险 + 失业保险 + 住房公积金 + 应扣金额 + 动态扣除项目
    detail.totalDeduction =
      pensionInsurance +
      medicalInsurance +
      unemploymentInsurance +
      housingFund +
      (detail.deductionAmount || 0) +
      dynamicDeduction

    // 实发金额 = 总收入 - 总扣除
    detail.netPay = detail.totalIncome - detail.totalDeduction
  }

  const handleAmountChange = (index, field, value) => {
    const newDetails = [...employeeDetails]
    newDetails[index][field] = value || 0
    calculateTotals(newDetails[index])
    setEmployeeDetails(newDetails)
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      const submitData = {
        details: employeeDetails.map(detail => ({
          detailId: detail.detailId,
          awardAmount: detail.awardAmount || 0,
          deductionAmount: detail.deductionAmount || 0
        }))
      }
      
      const response = await salaryIssuanceService.approveReview(currentRecord.issuanceId, submitData)
      if (response.code === 200) {
        message.success('复核通过')
        setShowDetail(false)
        setCurrentRecord(null)
        setEmployeeDetails([])
        loadData()
      } else {
        message.error(response.message || '复核失败')
      }
    } catch (error) {
      console.error('复核失败:', error)
      message.error('复核失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
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
    
    loadData(page, size)
  }

  const columns = [
    {
      title: '薪酬单号',
      dataIndex: 'salarySlipNumber',
      key: 'salarySlipNumber',
      render: (text) => text ? <a style={{ color: '#1890ff' }}>{text}</a> : '-'
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
      title: '登记时间',
      dataIndex: 'registrationTime',
      key: 'registrationTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="orange">待复核</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleReview(record)}
        >
          复核
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
    const issuanceMonth = currentRecord?.issuanceMonth ? dayjs(currentRecord.issuanceMonth) : null
    const nextMonthStart = issuanceMonth ? issuanceMonth.add(1, 'month').startOf('month') : null

    // 添加动态收入项目列（排除已映射的固定字段）
    // 只显示在发放月份之前创建的薪酬项目
    const fixedIncomeCodes = ['S001', 'S002', 'S003', 'S004']
    const dynamicIncomeColumns = salaryItems
      .filter(item => {
        // 过滤固定字段
        if (item.itemType !== 'INCOME' || fixedIncomeCodes.includes(item.itemCode)) {
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
          return value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      },
      {
        title: '医疗保险',
        dataIndex: 'medicalInsurance',
        key: 'medicalInsurance',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'medicalInsurance', 'S007')
          return value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      },
      {
        title: '失业保险',
        dataIndex: 'unemploymentInsurance',
        key: 'unemploymentInsurance',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'unemploymentInsurance', 'S008')
          return value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      },
      {
        title: '住房公积金',
        dataIndex: 'housingFund',
        key: 'housingFund',
        width: 120,
        render: (amount, record) => {
          const value = getInsuranceAmount(record, 'housingFund', 'S009')
          return value > 0 ? `¥${value.toFixed(2)}` : '-'
        }
      }
    ]

    // 添加动态扣除项目列（排除已映射的固定字段）
    // 只显示在发放月份之前创建的薪酬项目
    const fixedDeductionCodes = ['S006', 'S007', 'S008', 'S009']
    const dynamicDeductionColumns = salaryItems
      .filter(item => {
        // 过滤固定字段
        if (item.itemType !== 'DEDUCTION' || fixedDeductionCodes.includes(item.itemCode)) {
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
        return sum + getInsuranceAmount(detail, 'pensionInsurance', 'S006')
      } else if (field === 'medicalInsurance') {
        return sum + getInsuranceAmount(detail, 'medicalInsurance', 'S007')
      } else if (field === 'unemploymentInsurance') {
        return sum + getInsuranceAmount(detail, 'unemploymentInsurance', 'S008')
      } else if (field === 'housingFund') {
        return sum + getInsuranceAmount(detail, 'housingFund', 'S009')
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
          <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
          薪酬发放复核
        </Title>

        {/* 详情表格 */}
        <Card>
          <Table
            columns={detailColumns}
            dataSource={[...employeeDetails, totalRow]}
            rowKey={(record, index) => record.detailId || record.employeeId || `total-${index}`}
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
                loadData()
              }}
            >
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApprove}
              loading={loading}
            >
              复核通过
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
        <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
        待复核的薪酬单
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
          rowKey="issuanceId"
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
      </Card>
    </div>
  )
}

export default SalaryIssuanceReview
