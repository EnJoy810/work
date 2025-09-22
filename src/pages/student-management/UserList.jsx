import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, Pagination } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
// import request from '../utils/request' // 暂时注释，实际项目中需要使用
import { formatDate } from '../../utils/tools'

const { Option } = Select
const { TextArea } = Input

const UserList = () => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // 实际项目中，这里应该调用真实的API
      // const response = await request.get('/users', { page, pageSize, keyword: searchText })
      
      // 模拟数据
      const mockData = {
        data: Array(pageSize).fill(null).map((_, index) => ({
          id: (page - 1) * pageSize + index + 1,
          name: `用户${(page - 1) * pageSize + index + 1}`,
          age: 20 + Math.floor(Math.random() * 30),
          gender: ['男', '女'][Math.floor(Math.random() * 2)],
          email: `user${(page - 1) * pageSize + index + 1}@example.com`,
          phone: '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
          role: ['管理员', '普通用户', '游客'][Math.floor(Math.random() * 3)],
          status: ['正常', '禁用'][Math.floor(Math.random() * 2)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })),
        total: 100
      }
      
      setUsers(mockData.data)
      setTotal(mockData.total)
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载用户数据
  useEffect(() => {
    fetchUsers()
  }, [page, pageSize, searchText])

  // 搜索用户
  const handleSearch = (value) => {
    setSearchText(value)
    setPage(1)
  }

  // 打开新增/编辑模态框
  const showModal = (user = null) => {
    setCurrentUser(user)
    if (user) {
      form.setFieldsValue({
        ...user,
        status: user.status === '正常' ? 1 : 0
      })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  // 保存用户信息
  const handleSave = async () => {
    setLoading(true)
    try {
      // 实际项目中，这里应该调用真实的API
      // if (currentUser) {
      //   await request.put(`/users/${currentUser.id}`, form.getFieldsValue())
      // } else {
      //   await request.post('/users', form.getFieldsValue())
      // }
      
      // 模拟保存成功
      setTimeout(() => {
        setIsModalVisible(false)
        fetchUsers()
      }, 1000)
    } catch (error) {
      console.error('保存用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除用户
  const handleDelete = async () => {
    Modal.confirm({
      title: '确定要删除这个用户吗？',
      content: '删除后将无法恢复',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        try {
          // 实际项目中，这里应该调用真实的API
          // await request.delete(`/users/${id}`)
          
          // 模拟删除成功
          setTimeout(() => {
            fetchUsers()
          }, 1000)
        } catch (error) {
          console.error('删除用户失败:', error)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        return status === '正常' ? (
          <span style={{ color: 'green' }}>正常</span>
        ) : (
          <span style={{ color: 'red' }}>禁用</span>
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: createdAt => formatDate(createdAt, 'YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>用户管理</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input.Search
            placeholder="搜索用户"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            新增用户
          </Button>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(p) => setPage(p)}
          onShowSizeChange={(p, size) => {
            setPageSize(size)
            setPage(p)
          }}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条记录`}
        />
      </div>

      {/* 新增/编辑用户模态框 */}
      <Modal
        title={currentUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="age"
            label="年龄"
            rules={[{ required: true, message: '请输入年龄' }]}
          >
            <Input type="number" placeholder="请输入年龄" />
          </Form.Item>
          
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Select placeholder="请选择性别">
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="管理员">管理员</Option>
              <Option value="普通用户">普通用户</Option>
              <Option value="游客">游客</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={4} placeholder="请输入备注" />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {currentUser ? '更新' : '添加'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserList