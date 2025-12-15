import React, { useState, useEffect } from 'react'
import { Table, Form, Input, Select, DatePicker, Button, Space, message, Modal, Row, Col, Divider, Descriptions, Image, Upload } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons'
import { employeeArchiveService } from '../../services/employeeArchiveService'
import { organizationService } from '../../services/organizationService'
import { positionService } from '../../services/positionService'
import { salaryStandardService } from '../../services/salaryStandardService'
import { useAuth } from '../../contexts/AuthContext'
import dayjs from 'dayjs'

const { TextArea } = Input
const { RangePicker } = DatePicker

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

const ArchiveQuery = () => {
  const { hasRole } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [updateForm] = Form.useForm()
  const [level1Orgs, setLevel1Orgs] = useState([])
  const [level2Orgs, setLevel2Orgs] = useState([])
  const [level3Orgs, setLevel3Orgs] = useState([])
  const [positions, setPositions] = useState([])
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updatePhotoFile, setUpdatePhotoFile] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadLevel1Orgs()
    loadData()
  }, [])

  const loadLevel1Orgs = async () => {
    try {
      const response = await organizationService.getLevel1List()
      if (response.code === 200) {
        setLevel1Orgs(response.data || [])
      }
    } catch (error) {
      console.error('加载一级机构失败:', error)
    }
  }

  const loadLevel2Orgs = async (parentId) => {
    try {
      const response = await organizationService.getLevel2List(parentId)
      if (response.code === 200) {
        setLevel2Orgs(response.data || [])
      }
    } catch (error) {
      console.error('加载二级机构失败:', error)
    }
  }

  const loadLevel3Orgs = async (parentId) => {
    try {
      const response = await organizationService.getLevel3List(parentId)
      if (response.code === 200) {
        setLevel3Orgs(response.data || [])
      }
    } catch (error) {
      console.error('加载三级机构失败:', error)
    }
  }

  const loadPositions = async (thirdOrgId) => {
    try {
      const response = await positionService.getList(thirdOrgId)
      if (response.code === 200) {
        setPositions(response.data || [])
      }
    } catch (error) {
      console.error('加载职位失败:', error)
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
      
      const response = await employeeArchiveService.query(queryParams)
      if (response.code === 200) {
        setData(response.data?.list || [])
        setPagination(prev => ({
          ...prev,
          current: queryParams.page,
          pageSize: queryParams.size,
          total: response.data?.total || 0
        }))
      }
    } catch (error) {
      message.error('查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    
    if (values.firstOrgId) params.firstOrgId = values.firstOrgId
    if (values.secondOrgId) params.secondOrgId = values.secondOrgId
    if (values.thirdOrgId) params.thirdOrgId = values.thirdOrgId
    if (values.positionId) params.positionId = values.positionId
    // 处理登记时间范围
    if (values.registrationTime && values.registrationTime.length === 2) {
      params.startDate = values.registrationTime[0].format('YYYY-MM-DD')
      params.endDate = values.registrationTime[1].format('YYYY-MM-DD')
    }
    
    setPagination({ ...pagination, current: 1 })
    loadData(params)
  }

  const handleReset = () => {
    form.resetFields()
    setLevel2Orgs([])
    setLevel3Orgs([])
    setPositions([])
    setPagination({ ...pagination, current: 1 })
    loadData()
  }

  const handleTableChange = (newPagination, filters, sorter) => {
    const values = form.getFieldsValue()
    const params = {}
    
    // 保持查询条件
    if (values.firstOrgId) params.firstOrgId = values.firstOrgId
    if (values.secondOrgId) params.secondOrgId = values.secondOrgId
    if (values.thirdOrgId) params.thirdOrgId = values.thirdOrgId
    if (values.positionId) params.positionId = values.positionId
    // 处理登记时间范围
    if (values.registrationTime && values.registrationTime.length === 2) {
      params.startDate = values.registrationTime[0].format('YYYY-MM-DD')
      params.endDate = values.registrationTime[1].format('YYYY-MM-DD')
    }
    
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
    
    // 确保页码和每页数量都是有效数字
    page = page > 0 ? page : 1
    size = size > 0 ? size : 10
    
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
      // 获取档案详情
      const detailResponse = await employeeArchiveService.getDetail(record.archiveId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        console.log('档案详情:', detail)
        console.log('照片URL:', detail.photoUrl)
        setCurrentRecord(detail)
        setViewModalVisible(true)
      }
    } catch (error) {
      message.error('获取档案详情失败')
    }
  }

  const handleUpdate = async (record) => {
    try {
      // 获取档案详情
      const detailResponse = await employeeArchiveService.getDetail(record.archiveId)
      if (detailResponse.code === 200) {
        const detail = detailResponse.data
        setCurrentRecord(detail)
        setUpdatePhotoFile(null) // 重置照片文件
        // 设置表单初始值
        updateForm.setFieldsValue({
          ...detail,
          birthday: detail.birthday ? dayjs(detail.birthday) : null
        })
        setUpdateModalVisible(true)
      }
    } catch (error) {
      message.error('获取档案详情失败')
    }
  }
  
  const handleUpdatePhotoChange = (info) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      setUpdatePhotoFile(info.file.originFileObj || info.file)
    }
  }
  
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  const handleUpdateSubmit = async (values) => {
    setUpdateLoading(true)
    try {
      // 从表单值中获取照片文件
      let photoFileToUpload = updatePhotoFile
      if (values.photo && values.photo.length > 0) {
        const file = values.photo[0]
        photoFileToUpload = file.originFileObj || file
      }
      
      const submitData = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
        photo: undefined // 移除photo字段，不发送到后端
      }
      
      const response = await employeeArchiveService.update(currentRecord.archiveId, submitData)
      if (response.code === 200) {
        // 如果有新照片，上传照片
        if (photoFileToUpload) {
          try {
            console.log('开始上传照片，档案ID:', currentRecord.archiveId, '文件:', photoFileToUpload)
            const uploadResponse = await employeeArchiveService.uploadPhoto(currentRecord.archiveId, photoFileToUpload)
            console.log('照片上传响应:', uploadResponse)
            if (uploadResponse.code === 200) {
              message.success('档案变更成功，照片已更新，等待复核')
            } else {
              message.warning('档案变更成功，但照片上传失败：' + (uploadResponse.message || '未知错误'))
            }
          } catch (error) {
            console.error('上传照片失败:', error)
            message.warning('档案变更成功，但照片上传失败：' + (error.message || '未知错误'))
          }
        } else {
          message.success('档案变更成功，等待复核')
        }
        
        setUpdateModalVisible(false)
        updateForm.resetFields()
        setCurrentRecord(null)
        setUpdatePhotoFile(null)
        loadData()
      } else {
        message.error(response.message || '变更失败')
      }
    } catch (error) {
      message.error('变更失败：' + (error.message || '未知错误'))
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleJobTitleChange = async (value) => {
    const positionId = updateForm.getFieldValue('positionId')
    if (positionId && value) {
      try {
        const response = await salaryStandardService.getByPositionAndJobTitle(positionId, value)
        if (response.code === 200 && response.data) {
          updateForm.setFieldsValue({ salaryStandardId: response.data.standardId })
        } else {
          updateForm.setFieldsValue({ salaryStandardId: undefined })
        }
      } catch (error) {
        console.error('加载薪酬标准失败:', error)
        updateForm.setFieldsValue({ salaryStandardId: undefined })
      }
    } else {
      updateForm.setFieldsValue({ salaryStandardId: undefined })
    }
  }

  const getJobTitleText = (jobTitle) => {
    const map = {
      'JUNIOR': '初级',
      'INTERMEDIATE': '中级',
      'SENIOR': '高级'
    }
    return map[jobTitle] || jobTitle
  }

  const getStatusText = (status) => {
    const map = {
      'PENDING_REVIEW': '待复核',
      'NORMAL': '正常',
      'DELETED': '已删除'
    }
    return map[status] || status
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
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender === 'MALE' ? '男' : '女'
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusText(status)
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
          {hasRole(['HR_SPECIALIST']) && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
            >
              变更
            </Button>
          )}
          <Button
            type={hasRole(['HR_SPECIALIST']) ? 'default' : 'primary'}
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="firstOrgId" label="一级机构">
          <Select
            style={{ width: 150 }}
            placeholder="选择一级机构"
            onChange={(value) => {
              form.setFieldsValue({ secondOrgId: undefined, thirdOrgId: undefined, positionId: undefined })
              setLevel2Orgs([])
              setLevel3Orgs([])
              setPositions([])
              loadLevel2Orgs(value)
            }}
          >
            {level1Orgs.map(org => (
              <Select.Option key={org.orgId} value={org.orgId}>
                {org.orgName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="secondOrgId" label="二级机构">
          <Select
            style={{ width: 150 }}
            placeholder="选择二级机构"
            onChange={(value) => {
              form.setFieldsValue({ thirdOrgId: undefined, positionId: undefined })
              setLevel3Orgs([])
              setPositions([])
              loadLevel3Orgs(value)
            }}
          >
            {level2Orgs.map(org => (
              <Select.Option key={org.orgId} value={org.orgId}>
                {org.orgName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="thirdOrgId" label="三级机构">
          <Select
            style={{ width: 150 }}
            placeholder="选择三级机构"
            onChange={(value) => {
              form.setFieldsValue({ positionId: undefined })
              setPositions([])
              loadPositions(value)
            }}
          >
            {level3Orgs.map(org => (
              <Select.Option key={org.orgId} value={org.orgId}>
                {org.orgName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="positionId" label="职位名称">
          <Select style={{ width: 150 }} placeholder="选择职位名称">
            {positions.map(pos => (
              <Select.Option key={pos.positionId} value={pos.positionId}>
                {pos.positionName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="registrationTime" label="登记时间">
          <RangePicker style={{ width: 300 }} format="YYYY/MM/DD" placeholder={['开始日期', '结束日期']} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={handleReset}>
            重置条件
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

      {/* 查看详情弹窗 */}
      <Modal
        title="档案详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false)
          setCurrentRecord(null)
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false)
            setCurrentRecord(null)
          }}>
            关闭
          </Button>
        ]}
      >
        {currentRecord && (
          <div>
            {/* 基本信息 */}
            <Divider orientation="left">基本信息</Divider>
            {currentRecord.photoUrl ? (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>员工照片</strong>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                      URL: {currentRecord.photoUrl}
                    </div>
                  </div>
                  <Image
                    width={150}
                    src={currentRecord.photoUrl.startsWith('http') 
                      ? currentRecord.photoUrl 
                      : `http://localhost:8082${currentRecord.photoUrl}`}
                    alt="员工照片"
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3MoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    onError={(e) => {
                      const imgSrc = currentRecord.photoUrl.startsWith('http') 
                        ? currentRecord.photoUrl 
                        : `http://localhost:8082${currentRecord.photoUrl}`
                      console.error('图片加载失败:', {
                        originalUrl: currentRecord.photoUrl,
                        fullUrl: imgSrc,
                        error: e
                      })
                      message.error('图片加载失败，请检查照片URL是否正确')
                    }}
                    onLoad={() => {
                      console.log('图片加载成功:', currentRecord.photoUrl)
                    }}
                  />
                </Col>
              </Row>
            ) : (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <div style={{ color: '#999' }}>暂无照片</div>
                </Col>
              </Row>
            )}
            <Descriptions column={2} bordered>
              <Descriptions.Item label="档案编号">{currentRecord.archiveNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="姓名">{currentRecord.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">{currentRecord.gender === 'MALE' ? '男' : currentRecord.gender === 'FEMALE' ? '女' : '-'}</Descriptions.Item>
              <Descriptions.Item label="身份证号码">{currentRecord.idNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生日期">{currentRecord.birthday ? dayjs(currentRecord.birthday).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{currentRecord.age || '-'}</Descriptions.Item>
            </Descriptions>

            {/* 机构与职位信息 */}
            <Divider orientation="left">机构与职位信息</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="一级机构">{currentRecord.firstOrgName || '-'}</Descriptions.Item>
              <Descriptions.Item label="二级机构">{currentRecord.secondOrgName || '-'}</Descriptions.Item>
              <Descriptions.Item label="三级机构">{currentRecord.thirdOrgName || '-'}</Descriptions.Item>
              <Descriptions.Item label="职位">{currentRecord.positionName || '-'}</Descriptions.Item>
              <Descriptions.Item label="职称">{getJobTitleText(currentRecord.jobTitle) || '-'}</Descriptions.Item>
              <Descriptions.Item label="薪酬标准ID">{currentRecord.salaryStandardId || '-'}</Descriptions.Item>
            </Descriptions>

            {/* 个人信息 */}
            <Divider orientation="left">个人信息</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="国籍">{currentRecord.nationality || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生地">{currentRecord.placeOfBirth || '-'}</Descriptions.Item>
              <Descriptions.Item label="民族">{currentRecord.ethnicity || '-'}</Descriptions.Item>
              <Descriptions.Item label="宗教信仰">{currentRecord.religiousBelief || '-'}</Descriptions.Item>
              <Descriptions.Item label="政治面貌">{currentRecord.politicalStatus || '-'}</Descriptions.Item>
              <Descriptions.Item label="学历">{currentRecord.educationLevel || '-'}</Descriptions.Item>
              <Descriptions.Item label="学历专业">{currentRecord.major || '-'}</Descriptions.Item>
            </Descriptions>

            {/* 联系信息 */}
            <Divider orientation="left">联系信息</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Email">{currentRecord.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="电话">{currentRecord.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机">{currentRecord.mobile || '-'}</Descriptions.Item>
              <Descriptions.Item label="QQ">{currentRecord.qq || '-'}</Descriptions.Item>
              <Descriptions.Item label="住址" span={2}>{currentRecord.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮编">{currentRecord.postalCode || '-'}</Descriptions.Item>
            </Descriptions>

            {/* 其他信息 */}
            <Divider orientation="left">其他信息</Divider>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="爱好">{currentRecord.hobby || '-'}</Descriptions.Item>
              <Descriptions.Item label="个人履历">
                <div style={{ whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto' }}>
                  {currentRecord.personalResume || '-'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="家庭关系信息">
                <div style={{ whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto' }}>
                  {currentRecord.familyRelationship || '-'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                <div style={{ whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto' }}>
                  {currentRecord.remarks || '-'}
                </div>
              </Descriptions.Item>
            </Descriptions>

            {/* 系统信息 */}
            <Divider orientation="left">系统信息</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="状态">{getStatusText(currentRecord.status) || '-'}</Descriptions.Item>
              <Descriptions.Item label="登记人">{currentRecord.registrarName || '-'}</Descriptions.Item>
              <Descriptions.Item label="登记时间">{currentRecord.registrationTime ? dayjs(currentRecord.registrationTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
              {currentRecord.updateTime && (
                <Descriptions.Item label="更新时间">{dayjs(currentRecord.updateTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 变更弹窗 - 仅人事专员可见 */}
      {hasRole(['HR_SPECIALIST']) && updateModalVisible && (
        <Modal
          title="档案变更"
          open={updateModalVisible}
          onOk={() => updateForm.submit()}
          onCancel={() => {
            setUpdateModalVisible(false)
            updateForm.resetFields()
            setCurrentRecord(null)
            setUpdatePhotoFile(null)
          }}
          width={900}
          confirmLoading={updateLoading}
          okText="提交变更"
          cancelText="取消"
        >
          <Form
            form={updateForm}
            layout="vertical"
            onFinish={handleUpdateSubmit}
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

            {/* 员工照片 */}
            <Divider orientation="left">员工照片</Divider>
            <Row gutter={16}>
              <Col span={24}>
                {currentRecord?.photoUrl && !updatePhotoFile && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>当前照片</strong>
                    </div>
                    <Image
                      width={150}
                      src={currentRecord.photoUrl.startsWith('http') 
                        ? currentRecord.photoUrl 
                        : `http://localhost:8082${currentRecord.photoUrl}`}
                      alt="当前员工照片"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3MoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  </div>
                )}
                <Form.Item
                  name="photo"
                  label={updatePhotoFile ? "新照片（已选择）" : "上传新照片"}
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    beforeUpload={() => false}
                    onChange={handleUpdatePhotoChange}
                    maxCount={1}
                    accept="image/*"
                    listType="picture-card"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传照片</div>
                    </div>
                  </Upload>
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
      )}
    </div>
  )
}

export default ArchiveQuery
