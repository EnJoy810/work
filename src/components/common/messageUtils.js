import { useContext, useMemo } from 'react';
import { message } from 'antd';
import { MessageContext } from './messageContext';

/**
 * 自定义Hook - 获取message API实例
 * @returns {MessageInstance} message API实例
 */
export const useMessage = () => {
  const messageApi = useContext(MessageContext);
  
  if (!messageApi) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  
  return messageApi;
};

/**
 * 配置默认选项
 */
export const defaultOptions = {
  // 默认持续时间
  duration: 3,
  // 默认是否可关闭
  closable: false,
  // 默认顶部偏移量
  top: 24,
  // 默认显示最大数量
  maxCount: 1,
};

/**
 * 创建消息实例的工厂函数
 * @param {MessageInstance} messageApi - message API实例
 * @param {string} type - 消息类型
 * @param {string} content - 消息内容
 * @param {Object} options - 配置选项
 * @returns {MessageType} message实例
 */
export const createMessage = (messageApi, type, content, options = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 使用正确的参数格式传递给Ant Design的message API
  // 确保duration参数被正确识别
  return messageApi.open({
    type,
    content,
    ...mergedOptions,
  });
};

/**
 * 消息工具类 - 使用messageApi实例创建各种消息
 */
export class MessageUtil {
  constructor(messageApi) {
    this.messageApi = messageApi;
  }
  
  /**
   * 成功消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  success(content, options = {}) {
    return createMessage(this.messageApi, 'success', content, options);
  }
  
  /**
   * 错误消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  error(content, options = {}) {
    return createMessage(this.messageApi, 'error', content, options);
  }
  
  /**
   * 警告消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  warning(content, options = {}) {
    return createMessage(this.messageApi, 'warning', content, options);
  }
  
  /**
   * 信息消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  info(content, options = {}) {
    return createMessage(this.messageApi, 'info', content, options);
  }
  
  /**
   * 加载消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  loading(content, options = {}) {
    return createMessage(this.messageApi, 'loading', content, options);
  }
  
  /**
   * 关闭所有消息提示
   */
  destroy() {
    this.messageApi.destroy();
  }
};

/**
 * 组件内部使用的消息Hook
 * @returns {Object} 包含各种消息方法的对象
 */
export const useMessageService = () => {
  const messageApi = useMessage();
  
  return useMemo(() => {
    const messageUtil = new MessageUtil(messageApi);
    
    return {
      /**
       * 成功消息提示
       * @param {string} content - 消息内容
       * @param {Object} options - 配置选项
       * @returns {MessageType} message实例
       */
      showSuccess: (content, options = {}) => messageUtil.success(content, options),
      
      /**
       * 错误消息提示
       * @param {string} content - 消息内容
       * @param {Object} options - 配置选项
       * @returns {MessageType} message实例
       */
      showError: (content, options = {}) => messageUtil.error(content, options),
      
      /**
       * 警告消息提示
       * @param {string} content - 消息内容
       * @param {Object} options - 配置选项
       * @returns {MessageType} message实例
       */
      showWarning: (content, options = {}) => messageUtil.warning(content, options),
      
      /**
       * 信息消息提示
       * @param {string} content - 消息内容
       * @param {Object} options - 配置选项
       * @returns {MessageType} message实例
       */
      showInfo: (content, options = {}) => messageUtil.info(content, options),
      
      /**
       * 加载消息提示
       * @param {string} content - 消息内容
       * @param {Object} options - 配置选项
       * @returns {MessageType} message实例
       */
      showLoading: (content, options = {}) => messageUtil.loading(content, options),
      
      /**
       * 关闭所有消息提示
       */
      closeAllMessages: () => messageUtil.destroy(),
      
      // 原始messageApi实例
      messageApi,
    };
  }, [messageApi]);
};

// 全局配置函数
export const configMessage = (options) => {
  message.config(options);
};

// 默认导出，使用原有的API风格，保持兼容性
let globalMessageApi = null;

export default {
  /**
   * 设置全局messageApi实例（内部使用）
   * @param {MessageInstance} api - message API实例
   */
  _setApi: (api) => {
    globalMessageApi = api;
  },
  
  /**
   * 成功消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  success: (content, options = {}) => {
    if (!globalMessageApi) {
      console.warn('Message API not initialized. Please use useMessageService in components.');
      return message.success(content, { ...defaultOptions, ...options });
    }
    return createMessage(globalMessageApi, 'success', content, options);
  },
  
  /**
   * 错误消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  error: (content, options = {}) => {
    if (!globalMessageApi) {
      console.warn('Message API not initialized. Please use useMessageService in components.');
      return message.error(content, { ...defaultOptions, ...options });
    }
    return createMessage(globalMessageApi, 'error', content, options);
  },
  
  /**
   * 警告消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  warning: (content, options = {}) => {
    if (!globalMessageApi) {
      console.warn('Message API not initialized. Please use useMessageService in components.');
      return message.warning(content, { ...defaultOptions, ...options });
    }
    return createMessage(globalMessageApi, 'warning', content, options);
  },
  
  /**
   * 信息消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  info: (content, options = {}) => {
    if (!globalMessageApi) {
      console.warn('Message API not initialized. Please use useMessageService in components.');
      return message.info(content, { ...defaultOptions, ...options });
    }
    return createMessage(globalMessageApi, 'info', content, options);
  },
  
  /**
   * 加载消息提示
   * @param {string} content - 消息内容
   * @param {Object} options - 配置选项
   * @returns {MessageType} message实例
   */
  loading: (content, options = {}) => {
    if (!globalMessageApi) {
      console.warn('Message API not initialized. Please use useMessageService in components.');
      return message.loading(content, { ...defaultOptions, ...options });
    }
    return createMessage(globalMessageApi, 'loading', content, options);
  },
  
  /**
   * 全局配置消息提示
   * @param {Object} options - 全局配置选项
   */
  config: configMessage,
  
  /**
   * 关闭所有消息提示
   */
  destroy: () => {
    if (globalMessageApi) {
      globalMessageApi.destroy();
    } else {
      message.destroy();
    }
  },
};