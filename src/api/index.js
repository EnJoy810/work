/**
 * API统一导出
 * 提供所有API模块的统一入口
 */

// 认证相关API
export * from './auth';
export { default as authAPI } from './auth';

// 考试管理API
export * from './exam';
export { default as examAPI } from './exam';

// 批改相关API
export * from './grading';
export { default as gradingAPI } from './grading';

// 文件上传API
export * from './upload';
export { default as uploadAPI } from './upload';

// 题目相关API
export * from './question';
export { default as questionAPI } from './question';

