import React from 'react';
import { Button, Card, Row, Col, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  LoadingOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { useMessageService } from '../../components/common/message';

/**
 * 消息提示工具示例页面
 * 展示如何使用封装的message组件
 */
const MessageDemo = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showLoading, 
    closeAllMessages 
  } = useMessageService();
  // 基础消息提示示例
  const handleBasicMessages = () => {
    showSuccess('操作成功');
  };

  // 自定义持续时间的消息
  const handleCustomDuration = () => {
    showSuccess('5秒后自动关闭', { duration: 5 });
  };

  // 可关闭的消息
  const handleClosableMessage = () => {
    showInfo('这是一条可关闭的消息', { closable: true });
  };

  // 显示加载中消息
  const handleLoadingMessage = () => {
    const hide = showLoading('加载中...', { duration: 0 });
    // 模拟加载完成后关闭
    setTimeout(() => {
      hide();
      showSuccess('加载完成');
    }, 2000);
  };

  // 同时显示多条消息
  const handleMultipleMessages = () => {
    // 关闭之前的所有消息
    closeAllMessages();
    
    // 显示多条不同类型的消息
    showSuccess('第一条成功消息');
    setTimeout(() => {
      showInfo('第二条信息消息');
    }, 500);
    setTimeout(() => {
      showWarning('第三条警告消息');
    }, 1000);
  };

  // 使用直接导出的方法
  const handleMultipleMethodUsage = () => {
    showSuccess('使用直接导出的success方法');
    showError('使用直接导出的error方法');
    showWarning('使用直接导出的warning方法');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="消息提示工具示例" className="message-demo-card">
        <div style={{ marginBottom: 24 }}>
          <p>这是一个封装了Ant Design message组件的工具示例，提供了更便捷的调用方式。</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h3>基础消息类型</h3>
            <Space wrap>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => showSuccess('操作成功')}
              >
                成功消息
              </Button>
              <Button 
                danger 
                icon={<CloseCircleOutlined />}
                onClick={() => showError('操作失败')}
              >
                错误消息
              </Button>
              <Button 
                type="default" 
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={() => showWarning('警告消息')}
              >
                警告消息
              </Button>
              <Button 
                icon={<InfoCircleOutlined />}
                onClick={() => showInfo('信息提示')}
              >
                信息消息
              </Button>
            </Space>
          </Col>

          <Col span={24}>
            <h3>自定义配置</h3>
            <Space wrap>
              <Button onClick={handleBasicMessages}>
                基础成功消息
              </Button>
              <Button onClick={handleCustomDuration}>
                自定义持续时间
              </Button>
              <Button onClick={handleClosableMessage}>
                可关闭的消息
              </Button>
              <Button onClick={handleLoadingMessage}>
                加载中消息
              </Button>
              <Button onClick={handleMultipleMessages}>
                多条消息
              </Button>
            </Space>
          </Col>

          <Col span={24}>
            <h3>不同调用方式</h3>
            <Space wrap>
              <Button 
                type="primary" 
                icon={<SettingOutlined />}
                onClick={handleMultipleMethodUsage}
              >
                使用直接导出方法
              </Button>
              <Button 
                onClick={() => {
                  // 显示消息并获取实例，可手动关闭
                  const messageInstance = showInfo('点击下面按钮关闭我', { duration: 0 });
                  setTimeout(() => {
                    messageInstance(); // 手动关闭
                  }, 3000);
                }}
              >
                手动关闭消息
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MessageDemo;