import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, message, Card, Row, Col, Upload, Divider } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { employeeArchiveService } from '../../services/employeeArchiveService'
import { organizationService } from '../../services/organizationService'
import { positionService } from '../../services/positionService'
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

const ArchiveRegister = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [level1Orgs, setLevel1Orgs] = useState([])
  const [level2Orgs, setLevel2Orgs] = useState([])
  const [level3Orgs, setLevel3Orgs] = useState([])
  const [positions, setPositions] = useState([])
  const [photoFile, setPhotoFile] = useState(null)

  useEffect(() => {
    loadLevel1Orgs()
    loadAllLevel2Orgs()
    loadAllLevel3Orgs()
    loadAllPositions()
  }, [])

  const loadLevel1Orgs = async () => {
    try {
      const response = await organizationService.getLevel1List()
      if (response.code === 200) {
        setLevel1Orgs(response.data || [])
      } else {
        message.error(response.message || '加载一级机构失败')
      }
    } catch (error) {
      console.error('加载一级机构失败:', error)
      message.error('加载一级机构失败：' + (error.message || '未知错误'))
    }
  }

  const loadAllLevel2Orgs = async () => {
    try {
      const response = await organizationService.getLevel2List(null)
      if (response.code === 200) {
        setLevel2Orgs(response.data || [])
      } else {
        message.error(response.message || '加载二级机构失败')
      }
    } catch (error) {
      console.error('加载二级机构失败:', error)
      message.error('加载二级机构失败：' + (error.message || '未知错误'))
    }
  }

  const loadAllLevel3Orgs = async () => {
    try {
      const response = await organizationService.getLevel3List(null)
      if (response.code === 200) {
        setLevel3Orgs(response.data || [])
      } else {
        message.error(response.message || '加载三级机构失败')
      }
    } catch (error) {
      console.error('加载三级机构失败:', error)
      message.error('加载三级机构失败：' + (error.message || '未知错误'))
    }
  }

  const loadLevel2Orgs = async (parentId) => {
    try {
      const response = await organizationService.getLevel2List(parentId)
      if (response.code === 200) {
        setLevel2Orgs(response.data || [])
      } else {
        message.error(response.message || '加载二级机构失败')
      }
    } catch (error) {
      console.error('加载二级机构失败:', error)
      message.error('加载二级机构失败：' + (error.message || '未知错误'))
    }
  }

  const loadLevel3Orgs = async (parentId) => {
    try {
      const response = await organizationService.getLevel3List(parentId)
      if (response.code === 200) {
        setLevel3Orgs(response.data || [])
      } else {
        message.error(response.message || '加载三级机构失败')
      }
    } catch (error) {
      console.error('加载三级机构失败:', error)
      message.error('加载三级机构失败：' + (error.message || '未知错误'))
    }
  }

  const loadLevel3OrgsByFirstOrg = async (firstOrgId) => {
    try {
      const response = await organizationService.getLevel3List(null, firstOrgId)
      if (response.code === 200) {
        setLevel3Orgs(response.data || [])
      } else {
        message.error(response.message || '加载三级机构失败')
      }
    } catch (error) {
      console.error('加载三级机构失败:', error)
      message.error('加载三级机构失败：' + (error.message || '未知错误'))
    }
  }

  const loadPositions = async (params) => {
    try {
      const response = await positionService.getList(params)
      if (response.code === 200) {
        setPositions(response.data || [])
      } else {
        message.error(response.message || '加载职位失败')
      }
    } catch (error) {
      console.error('加载职位失败:', error)
      message.error('加载职位失败：' + (error.message || '未知错误'))
    }
  }

  const loadAllPositions = async () => {
    try {
      const response = await positionService.getList({})
      if (response.code === 200) {
        setPositions(response.data || [])
      } else {
        message.error(response.message || '加载职位失败')
      }
    } catch (error) {
      console.error('加载职位失败:', error)
      message.error('加载职位失败：' + (error.message || '未知错误'))
    }
  }

  const handleLevel1Change = async (value) => {
    if (value) {
      // 加载该一级机构下的二级机构
      await loadLevel2Orgs(value)
      // 加载该一级机构下的所有三级机构（允许跳过二级机构直接选择三级机构）
      await loadLevel3OrgsByFirstOrg(value)
      // 加载该一级机构下的所有职位
      await loadPositions({ firstOrgId: value })
    } else {
      await loadAllLevel2Orgs()
      await loadAllLevel3Orgs()
      await loadAllPositions()
    }
    form.setFieldsValue({ secondOrgId: undefined, thirdOrgId: undefined, positionId: undefined, salaryStandardId: undefined })
  }

  const handleLevel2Change = async (value) => {
    if (value) {
      // 获取二级机构详情，自动填充一级机构
      try {
        const response = await organizationService.getById(value)
        if (response.code === 200 && response.data) {
          const org = response.data
          if (org.parentId) {
            form.setFieldsValue({ firstOrgId: org.parentId })
          }
        }
      } catch (error) {
        console.error('获取二级机构详情失败:', error)
      }
      // 加载该二级机构下的三级机构
      await loadLevel3Orgs(value)
      // 加载该二级机构下的所有职位
      await loadPositions({ secondOrgId: value })
    } else {
      await loadAllLevel3Orgs()
      // 如果一级机构已选择，加载一级机构下的职位；否则加载所有职位
      const firstOrgId = form.getFieldValue('firstOrgId')
      if (firstOrgId) {
        await loadPositions({ firstOrgId })
      } else {
        await loadAllPositions()
      }
    }
    form.setFieldsValue({ thirdOrgId: undefined, positionId: undefined, salaryStandardId: undefined })
  }

  // 填充三级机构的上级机构信息（不清空职位）
  const fillParentOrgsForThirdOrg = async (thirdOrgId) => {
    if (!thirdOrgId) return
    
    try {
      const response = await organizationService.getById(thirdOrgId)
      if (response.code === 200 && response.data) {
        const org = response.data
        if (org.parentId) {
          const currentSecondOrgId = form.getFieldValue('secondOrgId')
          const currentFirstOrgId = form.getFieldValue('firstOrgId')
          
          // 如果二级机构未选择或与三级机构的父级不一致，则填充二级机构
          if (!currentSecondOrgId || currentSecondOrgId !== org.parentId) {
            form.setFieldsValue({ secondOrgId: org.parentId })
          }
          
          // 获取二级机构详情，找到一级机构
          const secondOrgResponse = await organizationService.getById(org.parentId)
          if (secondOrgResponse.code === 200 && secondOrgResponse.data) {
            const secondOrg = secondOrgResponse.data
            if (secondOrg.parentId) {
              // 如果一级机构未选择或与二级机构的父级不一致，则填充一级机构
              if (!currentFirstOrgId || currentFirstOrgId !== secondOrg.parentId) {
                form.setFieldsValue({ firstOrgId: secondOrg.parentId })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('获取三级机构详情失败:', error)
    }
  }

  const handleLevel3Change = async (value) => {
    if (value) {
      // 填充上级机构
      await fillParentOrgsForThirdOrg(value)
      // 加载该三级机构的职位
      await loadPositions({ thirdOrgId: value })
    } else {
      // 如果二级机构已选择，加载二级机构下的职位；如果一级机构已选择，加载一级机构下的职位；否则加载所有职位
      const secondOrgId = form.getFieldValue('secondOrgId')
      const firstOrgId = form.getFieldValue('firstOrgId')
      if (secondOrgId) {
        await loadPositions({ secondOrgId })
      } else if (firstOrgId) {
        await loadPositions({ firstOrgId })
      } else {
        await loadAllPositions()
      }
    }
    form.setFieldsValue({ positionId: undefined, salaryStandardId: undefined })
  }

  const loadSalaryStandard = async () => {
    const positionId = form.getFieldValue('positionId')
    const jobTitle = form.getFieldValue('jobTitle')
    if (positionId && jobTitle) {
      try {
        const response = await salaryStandardService.getByPositionAndJobTitle(positionId, jobTitle)
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

  const handlePositionChange = async (value) => {
    if (value) {
      // 获取职位详情，自动填充剩余机构
      try {
        const response = await positionService.getDetail(value)
        if (response.code === 200 && response.data) {
          const position = response.data
          if (position.thirdOrgId) {
            const currentFirstOrgId = form.getFieldValue('firstOrgId')
            const currentSecondOrgId = form.getFieldValue('secondOrgId')
            const currentThirdOrgId = form.getFieldValue('thirdOrgId')
            
            // 设置三级机构（不触发handleLevel3Change，避免清空positionId）
            if (!currentThirdOrgId || currentThirdOrgId !== position.thirdOrgId) {
              form.setFieldsValue({ thirdOrgId: position.thirdOrgId })
            }
            
            // 获取三级机构详情，填充上级机构
            const thirdOrgResponse = await organizationService.getById(position.thirdOrgId)
            if (thirdOrgResponse.code === 200 && thirdOrgResponse.data) {
              const thirdOrg = thirdOrgResponse.data
              
              // 如果二级机构未选择或与职位所属的二级机构不一致，则填充
              if (thirdOrg.parentId && (!currentSecondOrgId || currentSecondOrgId !== thirdOrg.parentId)) {
                form.setFieldsValue({ secondOrgId: thirdOrg.parentId })
                
                // 获取二级机构详情，填充一级机构
                const secondOrgResponse = await organizationService.getById(thirdOrg.parentId)
                if (secondOrgResponse.code === 200 && secondOrgResponse.data) {
                  const secondOrg = secondOrgResponse.data
                  
                  // 如果一级机构未选择或与职位所属的一级机构不一致，则填充
                  if (secondOrg.parentId && (!currentFirstOrgId || currentFirstOrgId !== secondOrg.parentId)) {
                    form.setFieldsValue({ firstOrgId: secondOrg.parentId })
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('获取职位详情失败:', error)
      }
    }
    await loadSalaryStandard()
  }

  const handleJobTitleChange = async (value) => {
    await loadSalaryStandard()
  }

  const handlePhotoChange = (info) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      setPhotoFile(info.file.originFileObj || info.file)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 转换日期格式
      const submitData = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      }
      
      // 先创建档案
      const response = await employeeArchiveService.create(submitData)
      if (response.code === 200) {
        const archiveId = response.data?.archiveId
        
        // 如果有照片，上传照片
        if (photoFile && archiveId) {
          try {
            await employeeArchiveService.uploadPhoto(archiveId, photoFile)
          } catch (error) {
            console.error('上传照片失败:', error)
            message.warning('档案登记成功，但照片上传失败')
          }
        }
        
        message.success('登记成功')
        form.resetFields()
        setPhotoFile(null)
      } else {
        message.error(response.message || '登记失败')
      }
    } catch (error) {
      message.error('登记失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="员工档案登记">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ nationality: '中国' }}
      >
        {/* 基本信息 */}
        <Divider orientation="left">基本信息</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="输入员工姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select placeholder="选择性别">
                <Select.Option value="MALE">男</Select.Option>
                <Select.Option value="FEMALE">女</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="idNumber"
              label="身份证号码"
            >
              <Input placeholder="输入身份证号码" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="birthday"
              label="出生日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="年/月/日" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        {/* 机构与职位信息 */}
        <Divider orientation="left">机构与职位信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="firstOrgId"
              label="一级机构"
              rules={[{ required: true, message: '请选择一级机构' }]}
            >
              <Select 
                placeholder="选择一级机构（或先选择二级/三级机构自动填充）" 
                onChange={handleLevel1Change}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {level1Orgs.map(org => (
                  <Select.Option key={org.orgId} value={org.orgId}>
                    {org.orgName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="secondOrgId"
              label="二级机构"
              rules={[{ required: true, message: '请选择二级机构' }]}
            >
              <Select 
                placeholder="选择二级机构（选择后自动填充一级机构）" 
                onChange={handleLevel2Change}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {level2Orgs.map(org => (
                  <Select.Option key={org.orgId} value={org.orgId}>
                    {org.orgName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="thirdOrgId"
              label="三级机构"
              rules={[{ required: true, message: '请选择三级机构' }]}
            >
              <Select 
                placeholder="选择三级机构（选择后自动填充上级机构）" 
                onChange={handleLevel3Change}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {level3Orgs.map(org => (
                  <Select.Option key={org.orgId} value={org.orgId}>
                    {org.orgName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="positionId"
              label="职位名称"
              rules={[{ required: true, message: '请选择职位名称' }]}
            >
              <Select 
                placeholder="选择职位名称（选择后自动填充三级机构）" 
                onChange={handlePositionChange}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {positions.map(pos => (
                  <Select.Option key={pos.positionId} value={pos.positionId}>
                    {pos.positionName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="jobTitle"
              label="职称"
            >
              <Select placeholder="选择职称" onChange={handleJobTitleChange}>
                <Select.Option value="JUNIOR">初级</Select.Option>
                <Select.Option value="INTERMEDIATE">中级</Select.Option>
                <Select.Option value="SENIOR">高级</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="salaryStandardId"
              label="薪酬标准"
            >
              <Input disabled placeholder="根据职位和职称自动匹配" />
            </Form.Item>
          </Col>
        </Row>

        {/* 个人信息 */}
        <Divider orientation="left">个人信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="birthday"
              label="出生日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="年/月/日" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="ethnicity"
              label="民族"
            >
              <Select placeholder="选择民族">
                {ethnicityOptions.map(ethnicity => (
                  <Select.Option key={ethnicity} value={ethnicity}>
                    {ethnicity}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="educationLevel"
              label="学历"
            >
              <Select placeholder="选择学历">
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
          <Col span={8}>
            <Form.Item
              name="email"
              label="Email"
            >
              <Input placeholder="输入Email地址" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="phone"
              label="电话"
            >
              <Input placeholder="输入联系电话" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="mobile"
              label="手机"
            >
              <Input placeholder="输入手机号码" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="address"
              label="住址"
            >
              <Input placeholder="输入联系地址" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="postalCode"
              label="邮编"
            >
              <Input placeholder="输入邮政编码" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="placeOfBirth"
              label="出生地"
            >
              <Input placeholder="输入出生地" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="qq"
              label="QQ"
            >
              <Input placeholder="输入QQ号码" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="religiousBelief"
              label="宗教信仰"
            >
              <Input placeholder="输入宗教信仰" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="politicalStatus"
              label="政治面貌"
            >
              <Input placeholder="输入政治面貌" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="major"
              label="学历专业"
            >
              <Input placeholder="输入学历专业" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hobby"
              label="爱好"
            >
              <Input placeholder="输入爱好" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="photo"
              label="员工照片"
            >
              <Upload
                beforeUpload={() => false}
                onChange={handlePhotoChange}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传照片</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="personalResume"
          label="个人履历"
        >
          <TextArea rows={4} placeholder="输入个人履历（大段文本）" />
        </Form.Item>

        <Form.Item
          name="familyRelationship"
          label="家庭关系信息"
        >
          <TextArea rows={4} placeholder="输入家庭关系信息（大段文本）" />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="备注"
        >
          <TextArea rows={4} placeholder="输入备注信息（大段文本）" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            提交登记
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ArchiveRegister
