import { useState } from 'react'
import { Button, Input, Table, Space, Divider } from 'antd'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      name: '张三',
      age: 32,
      address: '北京市朝阳区'
    },
    {
      key: '2',
      name: '李四',
      age: 42,
      address: '上海市浦东新区'
    },
    {
      key: '3',
      name: '王五',
      age: 36,
      address: '广州市天河区'
    }
  ])

  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link">编辑</Button>
          <Button type="link" danger>删除</Button>
        </Space>
      )
    }
  ]

  // 处理输入框变化
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  // 处理按钮点击，添加新数据
  const handleAddData = () => {
    if (inputValue.trim()) {
      const newData = {
        key: (dataSource.length + 1).toString(),
        name: inputValue,
        age: Math.floor(Math.random() * 50) + 20,
        address: '新地址'
      }
      setDataSource([...dataSource, newData])
      setInputValue('')
    }
  }

  return (
    <div className="container">
      <h1>React + Ant Design 示例</h1>
      
      <Divider orientation="left">按钮示例</Divider>
      <div className="button-group">
        <Button type="primary" onClick={() => setCount(count + 1)}>
          计数: {count}
        </Button>
        <Button>默认按钮</Button>
        <Button danger>危险按钮</Button>
        <Button disabled>禁用按钮</Button>
      </div>

      <Divider orientation="left">输入框示例</Divider>
      <div className="input-group">
        <Input 
          placeholder="请输入内容" 
          value={inputValue} 
          onChange={handleInputChange}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleAddData} style={{ marginLeft: 10 }}>
          添加
        </Button>
      </div>

      <Divider orientation="left">表格示例</Divider>
      <Table 
        dataSource={dataSource} 
        columns={columns} 
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 10 }}
      />
    </div>
  )
}

export default App
