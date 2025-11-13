import { createContext, useEffect } from 'react';
import { message } from 'antd';
// 导入默认导出以重新导出
import messageUtils from './messageUtils';

/**
 * 消息提示工具 - 基于Ant Design的message组件，使用message.useMessage()实现
 */

// 创建消息上下文
export const MessageContext = createContext(null);

/**
 * 消息提供者组件
 * 用于在应用顶层提供message API
 */
export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (messageUtils?._setApi) {
      messageUtils._setApi(messageApi);
    }
  }, [messageApi]);
  
  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

// 从messageUtils.js重新导出所有工具函数和hooks
export { useMessage, useMessageService, MessageUtil, configMessage } from './messageUtils';

// 重新导出默认导出
export default messageUtils;
