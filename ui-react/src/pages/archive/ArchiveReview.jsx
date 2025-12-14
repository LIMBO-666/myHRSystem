import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Row, Col, Divider } from 'antd'
import { CheckOutlined, EyeOutlined } from '@ant-design/icons'
import { employeeArchiveService } from '../../services/employeeArchiveService'
import { salaryStandardService } from '../../services/salaryStandardService'
import dayjs from 'dayjs'

const { TextArea } = Input

// 民族选项
const ethnicityOptions = [
  '汉族', '壮族', '满族', '回族', '苗族', '维吾尔族', '土家族', '彝族', '蒙古族', '藏族',
  '布依族', '侗族', '瑶族', '朝鲜族', '白族', '哈尼族', '哈萨克族', '黎族', '傣族', '畲族',
  '傈僳族', '仡佬族', '东乡族', '高山族', '拉祜族', '水族', '佤族', '纳西族', '羌族', '土族',
  '仫佬族', '锡伯族', '柯尔克孜族', '达斡尔族', '景颇族', '毛南族', '撒拉族', '布朗族', '塔吉克族', '阿昌族',
  '普米族', '鄂温克族', '怒族', '京族', '基诺族', '德昂族', '保安族', '俄罗斯族', '裕固族', '乌孜别克族',
  '门巴族', '鄂伦春族', '独龙族', '塔塔尔族', '赫哲族', '珞巴族', '其他'
]

// 学历选项
const educationOptions = [
  '小学', '初中', '高中', '中专', '大专', '本科', '硕士', '博士', '其他'
]

const ArchiveReview = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()
  const [reviewLoading, setReviewLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (pageNum, pageSizeNum) => {
    setLoading(true)
    try {
      const page = pageNum !== undefined && pageNum !== null ? Number(pageNum) : pagination.current
      const size = pageSizeNum !== undefined && pageSizeNum !== null ? Number(pageSizeNum) : pagination.pageSize
      
      const response = await employeeArchiveService.getPendingReviewList({
        page: page > 0 ? page : 1,
        size: size > 0 ? size : 10
      })
      if (response.code === 200) {
        setData(response.data?.list || [])
        setPagination(prev => ({
          ...prev,
          current: page > 0 ? page : 1,
          pageSize: size > 0 ? size : 10,
          total: response.data?.total || 0
        }))
      }
    } catch (error) {
      message.error('加载数据失败')
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
    
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: size
    }))
    
    loadData(page, size)
  }

  const handleReview = async (record) => {
    try {
      // 获取档案详情
      const detailResponse = await employeeArchiveService.getDetail(record.archiveId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        setCurrentRecord(detail)
        // 设置表单初始值
        form.setFieldsValue({
          ...detail,
          birthday: detail.birthday ? dayjs(detail.birthday) : null
        })
        setReviewModalVisible(true)
      }
    } catch (error) {
      message.error('获取档案详情失败')
    }
  }

  const handleJobTitleChange = async (value) => {
    const positionId = form.getFieldValue('positionId')
    if (positionId && value) {
      try {
        const response = await salaryStandardService.getByPositionAndJobTitle(positionId, value)
        if (response.code === 200 && response.data) {
          form.setFieldsValue({ salaryStandardId: response.data.standardId })
        } else {
          form.setFieldsValue({ salaryStandardId: undefined })
        }
      } catch (error) {
        console.error('加载薪酬标准失败:', error)
        form.setFieldsValue({ salaryStandardId: undefined })
      }
    } else {
      form.setFieldsValue({ salaryStandardId: undefined })
    }
  }

  const handleReviewSubmit = async (values) => {
    setReviewLoading(true)
    try {
      const submitData = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
        approve: true, // 复核通过
        reviewComments: null // 不需要复核意见
      }
      
      const response = await employeeArchiveService.reviewAndApprove(
        currentRecord.archiveId,
        submitData
      )
      if (response.code === 200) {
        message.success('复核通过')
        setReviewModalVisible(false)
        loadData()
      } else {
        message.error(response.message || '复核失败')
      }
    } catch (error) {
      message.error('复核失败：' + (error.message || '未知错误'))
    } finally {
      setReviewLoading(false)
    }
  }

  const columns = [
    {
      title: '档案编号',
      dataIndex: 'archiveNumber',
      key: 'archiveNumber',
      render: (text) => <a>{text}</a>
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '所属机构',
      dataIndex: 'orgFullPath',
      key: 'orgFullPath'
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName'
    },
    {
      title: '提交时间',
      dataIndex: 'registrationTime',
      key: 'registrationTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '登记人',
      dataIndex: 'registrarName',
      key: 'registrarName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'PENDING_REVIEW' ? 'orange' : 'green'}>
          {status === 'PENDING_REVIEW' ? '待复核' : '已通过'}
        </Tag>
      )
    },
    {
      title: '变更信息',
      key: 'updateInfo',
      render: (_, record) => {
        // 如果有updateTime且晚于registrationTime，说明被变更过
        if (record.updateTime && record.registrationTime) {
          const updateTime = dayjs(record.updateTime)
          const registrationTime = dayjs(record.registrationTime)
          if (updateTime.isAfter(registrationTime)) {
            return (
              <Tag color="blue">
                已变更 ({updateTime.format('YYYY-MM-DD HH:mm')})
              </Tag>
            )
          }
        }
        return '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING_REVIEW' ? (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleReview(record)}
            >
              复核
            </Button>
          ) : (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleReview(record)}
            >
              查看
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
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
        title="档案复核"
        open={reviewModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setReviewModalVisible(false)
          form.resetFields()
        }}
        width={900}
        confirmLoading={reviewLoading}
        okText="复核通过"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReviewSubmit}
        >
          {/* 基本信息 */}
          <Divider orientation="left">基本信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="archiveNumber" label="档案编号">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="姓名">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select>
                  <Select.Option value="MALE">男</Select.Option>
                  <Select.Option value="FEMALE">女</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="idNumber" label="身份证号码">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="birthday" label="出生日期">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="age" label="年龄">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* 机构与职位信息 */}
          <Divider orientation="left">机构与职位信息</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="firstOrgName" label="一级机构">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="secondOrgName" label="二级机构">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="thirdOrgName" label="三级机构">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="positionName" label="职位">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobTitle" label="职称">
                <Select onChange={handleJobTitleChange}>
                  <Select.Option value="JUNIOR">初级</Select.Option>
                  <Select.Option value="INTERMEDIATE">中级</Select.Option>
                  <Select.Option value="SENIOR">高级</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 个人信息 */}
          <Divider orientation="left">个人信息</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="nationality" label="国籍">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="placeOfBirth" label="出生地">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ethnicity" label="民族">
                <Select>
                  {ethnicityOptions.map(ethnicity => (
                    <Select.Option key={ethnicity} value={ethnicity}>
                      {ethnicity}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="religiousBelief" label="宗教信仰">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="politicalStatus" label="政治面貌">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="educationLevel" label="学历">
                <Select>
                  {educationOptions.map(education => (
                    <Select.Option key={education} value={education}>
                      {education}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="major" label="学历专业">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* 联系信息 */}
          <Divider orientation="left">联系信息</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="电话">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mobile" label="手机">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="address" label="住址">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="postalCode" label="邮编">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qq" label="QQ">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* 其他信息 */}
          <Divider orientation="left">其他信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hobby" label="爱好">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salaryStandardId" label="薪酬标准ID">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="personalResume" label="个人履历">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="familyRelationship" label="家庭关系信息">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ArchiveReview
