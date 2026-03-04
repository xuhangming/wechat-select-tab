// utils/errorHandler.js
// 错误类型定义和错误处理工具

/**
 * 错误类型常量
 */
const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',       // 输入验证失败
  TIME_RANGE_ERROR: 'TIME_RANGE_ERROR',       // 时间范围错误
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',         // 重复操作
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',         // 资源不存在
  PERMISSION_ERROR: 'PERMISSION_ERROR',       // 权限不足
  CAPACITY_ERROR: 'CAPACITY_ERROR',           // 容量已满
  DATABASE_ERROR: 'DATABASE_ERROR',           // 数据库错误
  NETWORK_ERROR: 'NETWORK_ERROR'              // 网络错误
};

/**
 * 创建标准错误响应
 * @param {string} errorType - 错误类型（来自 ErrorTypes）
 * @param {string} message - 用户友好的错误消息
 * @param {Object} details - 可选的详细信息（仅开发环境）
 * @returns {Object} 标准错误响应对象
 */
const createErrorResponse = (errorType, message, details = null) => {
  const response = {
    success: false,
    errorType,
    message
  };
  
  // 仅在开发环境包含详细信息
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  
  return response;
};

/**
 * 创建成功响应
 * @param {Object} data - 响应数据
 * @param {string} message - 可选的成功消息
 * @returns {Object} 标准成功响应对象
 */
const createSuccessResponse = (data = {}, message = '') => {
  return {
    success: true,
    message,
    ...data
  };
};

/**
 * 格式化验证错误
 * @param {Object} validationErrors - 验证错误对象
 * @returns {Object} 标准错误响应
 */
const formatValidationError = (validationErrors) => {
  const errorMessages = Object.values(validationErrors).join('；');
  return createErrorResponse(
    ErrorTypes.VALIDATION_ERROR,
    errorMessages,
    validationErrors
  );
};

/**
 * 处理数据库错误
 * @param {Error} error - 数据库错误对象
 * @returns {Object} 标准错误响应
 */
const handleDatabaseError = (error) => {
  console.error('数据库错误:', error);
  return createErrorResponse(
    ErrorTypes.DATABASE_ERROR,
    '操作失败，请稍后重试',
    { originalError: error.message }
  );
};

/**
 * 处理网络错误
 * @param {Error} error - 网络错误对象
 * @returns {Object} 标准错误响应
 */
const handleNetworkError = (error) => {
  console.error('网络错误:', error);
  return createErrorResponse(
    ErrorTypes.NETWORK_ERROR,
    '网络连接失败，请重试',
    { originalError: error.message }
  );
};

module.exports = {
  ErrorTypes,
  createErrorResponse,
  createSuccessResponse,
  formatValidationError,
  handleDatabaseError,
  handleNetworkError
};
