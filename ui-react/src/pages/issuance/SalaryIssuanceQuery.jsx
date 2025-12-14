import React, { useState, useEffect } from 'react'
import { Table, Form, Input, DatePicker, Button, message, Space, Tag, Card, Typography, Modal } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { salaryIssuanceService } from '../../services/salaryIssuanceService'
import { salaryItemService } from '../../services/salaryItemService'
import dayjs from 'dayjs'
import './SalaryIssuanceQuery.css'

const { Title } = Typography

const SalaryIssuanceQuery = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState([])
  const [salaryItems, setSalaryItems] = useState([]) // 所有薪酬项目列表
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    // 设置默认月份为当前月份
    form.setFieldsValue({ issuanceMonth: dayjs() })
    loadData()
    loadSalaryItems()
  }, [])

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

  const loadData = async (params = {}, page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      // 如果没有指定日期范围，使用月份选择器的值
      const formValues = form.getFieldsValue()
      const queryParams = {
        page: page,
        size: pageSize,
        ...params
      }
      
      // 如果查询参数中没有日期范围，使用月份选择器的值
      if (!queryParams.startDate && !queryParams.endDate && formValues.issuanceMonth) {
        const monthStart = formValues.issuanceMonth.startOf('month')
        const monthEnd = formValues.issuanceMonth.endOf('month')
        queryParams.startDate = monthStart.format('YYYY-MM-DD')
        queryParams.endDate = monthEnd.format('YYYY-MM-DD')
      }
      
      const response = await salaryIssuanceService.query(queryParams)
      if (response.code === 200) {
        setData(response.data?.list || [])
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.data?.total || 0
        })
      } else {
        message.error(response.message || '查询失败')
      }
    } catch (error) {
      console.error('查询失败:', error)
      message.error('查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    
    if (values.salarySlipNumber) params.salarySlipNumber = values.salarySlipNumber
    
    // 使用月份选择器的值设置日期范围
    const selectedMonth = values.issuanceMonth || dayjs() // 如果没选，默认当前月份
    const monthStart = selectedMonth.startOf('month')
    const monthEnd = selectedMonth.endOf('month')
    params.startDate = monthStart.format('YYYY-MM-DD')
    params.endDate = monthEnd.format('YYYY-MM-DD')
    
    setPagination({ ...pagination, current: 1 })
    loadData(params, 1, pagination.pageSize)
  }

  const handleReset = () => {
    form.resetFields()
    // 重置后设置默认月份为当前月份
    form.setFieldsValue({ issuanceMonth: dayjs() })
    setPagination({ ...pagination, current: 1 })
    loadData({}, 1, pagination.pageSize)
  }

  const handleViewDetail = async (record) => {
    setLoading(true)
    try {
      const detailResponse = await salaryIssuanceService.getDetail(record.issuanceId)
      if (detailResponse.code === 200 && detailResponse.data) {
        const details = (detailResponse.data.details || []).map(detail => ({
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
        setDetailModalVisible(true)
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

  const handleTableChange = (newPagination, filters, sorter) => {
    const values = form.getFieldsValue()
    const params = {}
    
    if (values.salarySlipNumber) params.salarySlipNumber = values.salarySlipNumber
    
    // 使用月份选择器的值设置日期范围
    const selectedMonth = values.issuanceMonth || dayjs() // 如果没选，默认当前月份
    const monthStart = selectedMonth.startOf('month')
    const monthEnd = selectedMonth.endOf('month')
    params.startDate = monthStart.format('YYYY-MM-DD')
    params.endDate = monthEnd.format('YYYY-MM-DD')
    
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
    
    loadData(params, page, size)
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
    totalIncome: calculateTotal('totalIncome'),
    totalDeduction: calculateTotal('totalDeduction'),
    netPay: calculateTotal('netPay')
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
      title: '发放时间',
      dataIndex: 'issuanceTime',
      key: 'issuanceTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING_REVIEW': '待复核',
          'EXECUTED': '已执行',
          'PAID': '已付款'
        }
        const colorMap = {
          'PENDING_REVIEW': 'orange',
          'EXECUTED': 'green',
          'PAID': 'blue'
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
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看明细
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
        width: 120,
        render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
      },
      {
        title: '应扣金额',
        dataIndex: 'deductionAmount',
        key: 'deductionAmount',
        width: 120,
        render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
      },
      {
        title: '总收入',
        dataIndex: 'totalIncome',
        key: 'totalIncome',
        width: 120,
        render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
      },
      {
        title: '总扣除',
        dataIndex: 'totalDeduction',
        key: 'totalDeduction',
        width: 120,
        render: (amount) => amount ? `¥${parseFloat(amount).toFixed(2)}` : '-'
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

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
        <SearchOutlined style={{ color: '#1890ff', marginRight: '8px', fontSize: '16px' }} />
        薪酬发放查询
      </Title>

      {/* 查询条件 */}
      <Card style={{ marginBottom: '16px' }}>
        <Form form={form} layout="inline">
          <Form.Item name="salarySlipNumber" label="薪酬单号">
            <Input style={{ width: 200 }} placeholder="输入薪酬单号" />
          </Form.Item>
          <Form.Item name="issuanceMonth" label="发放月份">
            <DatePicker 
              picker="month" 
              style={{ width: 200 }} 
              placeholder="选择月份" 
              format="YYYY-MM"
              allowClear={false}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置条件
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 查询结果表格 */}
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

      {/* 查看明细弹窗 */}
      <Modal
        title={
          <div>
            <EyeOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            薪酬发放明细 - {currentRecord?.salarySlipNumber}
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setCurrentRecord(null)
          setEmployeeDetails([])
        }}
        footer={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              setDetailModalVisible(false)
              setCurrentRecord(null)
              setEmployeeDetails([])
            }}
          >
            返回
          </Button>
        ]}
        width={1400}
      >
        <Table
          columns={detailColumns}
          dataSource={[...employeeDetails, totalRow]}
          rowKey={(record, index) => record.employeeId || `total-${index}`}
          pagination={false}
          scroll={{ x: 1400 }}
          loading={loading}
          rowClassName={(record, index) => {
            if (index === employeeDetails.length) {
              return 'total-row'
            }
            return ''
          }}
        />
      </Modal>
    </div>
  )
}

export default SalaryIssuanceQuery
