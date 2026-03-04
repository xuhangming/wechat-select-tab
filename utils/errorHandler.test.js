// utils/errorHandler.test.js
// 错误处理工具单元测试

const {
  ErrorTypes,
  createErrorResponse,
  createSuccessResponse,
  formatValidationError,
  handleDatabaseError,
  handleNetworkError
} = require('./errorHandler');

describe('错误处理工具测试', () => {
  describe('ErrorTypes', () => {
    test('应该定义所有错误类型常量', () => {
      expect(ErrorTypes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorTypes.TIME_RANGE_ERROR).toBe('TIME_RANGE_ERROR');
      expect(ErrorTypes.DUPLICATE_ERROR).toBe('DUPLICATE_ERROR');
      expect(ErrorTypes.NOT_FOUND_ERROR).toBe('NOT_FOUND_ERROR');
      expect(ErrorTypes.PERMISSION_ERROR).toBe('PERMISSION_ERROR');
      expect(ErrorTypes.CAPACITY_ERROR).toBe('CAPACITY_ERROR');
      expect(ErrorTypes.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ErrorTypes.NETWORK_ERROR).toBe('NETWORK_ERROR');
    });
  });

  describe('createErrorResponse', () => {
    test('应该创建标准错误响应', () => {
      const response = createErrorResponse(
        ErrorTypes.VALIDATION_ERROR,
        '验证失败'
      );
      
      expect(response).toEqual({
        success: false,
        errorType: ErrorTypes.VALIDATION_ERROR,
        message: '验证失败'
      });
    });

    test('在开发环境应该包含详细信息', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const details = { field: 'title', reason: 'too long' };
      const response = createErrorResponse(
        ErrorTypes.VALIDATION_ERROR,
        '验证失败',
        details
      );
      
      expect(response.details).toEqual(details);
      
      process.env.NODE_ENV = originalEnv;
    });

    test('在生产环境不应该包含详细信息', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const details = { field: 'title', reason: 'too long' };
      const response = createErrorResponse(
        ErrorTypes.VALIDATION_ERROR,
        '验证失败',
        details
      );
      
      expect(response.details).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('createSuccessResponse', () => {
    test('应该创建标准成功响应', () => {
      const data = { eventId: '123' };
      const response = createSuccessResponse(data, '创建成功');
      
      expect(response).toEqual({
        success: true,
        message: '创建成功',
        eventId: '123'
      });
    });

    test('应该支持空数据和消息', () => {
      const response = createSuccessResponse();
      
      expect(response).toEqual({
        success: true,
        message: ''
      });
    });
  });

  describe('formatValidationError', () => {
    test('应该格式化单个验证错误', () => {
      const errors = { title: '标题不能为空' };
      const response = formatValidationError(errors);
      
      expect(response.success).toBe(false);
      expect(response.errorType).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(response.message).toBe('标题不能为空');
    });

    test('应该格式化多个验证错误', () => {
      const errors = {
        title: '标题不能为空',
        categories: '至少需要一个类目',
        time: '开始时间必须早于结束时间'
      };
      const response = formatValidationError(errors);
      
      expect(response.success).toBe(false);
      expect(response.errorType).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(response.message).toContain('标题不能为空');
      expect(response.message).toContain('至少需要一个类目');
      expect(response.message).toContain('开始时间必须早于结束时间');
    });
  });

  describe('handleDatabaseError', () => {
    test('应该处理数据库错误', () => {
      const error = new Error('Connection failed');
      const response = handleDatabaseError(error);
      
      expect(response.success).toBe(false);
      expect(response.errorType).toBe(ErrorTypes.DATABASE_ERROR);
      expect(response.message).toBe('操作失败，请稍后重试');
    });
  });

  describe('handleNetworkError', () => {
    test('应该处理网络错误', () => {
      const error = new Error('Network timeout');
      const response = handleNetworkError(error);
      
      expect(response.success).toBe(false);
      expect(response.errorType).toBe(ErrorTypes.NETWORK_ERROR);
      expect(response.message).toBe('网络连接失败，请重试');
    });
  });

  describe('错误响应格式一致性', () => {
    test('所有错误响应应该包含必需字段', () => {
      const responses = [
        createErrorResponse(ErrorTypes.VALIDATION_ERROR, '测试'),
        formatValidationError({ test: '错误' }),
        handleDatabaseError(new Error('test')),
        handleNetworkError(new Error('test'))
      ];
      
      responses.forEach(response => {
        expect(response).toHaveProperty('success', false);
        expect(response).toHaveProperty('errorType');
        expect(response).toHaveProperty('message');
        expect(typeof response.errorType).toBe('string');
        expect(typeof response.message).toBe('string');
      });
    });
  });
});
