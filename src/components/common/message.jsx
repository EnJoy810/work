/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { message } from 'antd';
import { MessageContext } from './messageContext';
import messageUtils from './messageUtils';

/**
 * 消息提供者组件
 * 用于在应用顶层提供 AntD message API
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

// 保留向后兼容的命名导出（hooks/工具）
export { useMessage, useMessageService, MessageUtil, configMessage } from './messageUtils';

export default MessageProvider;
