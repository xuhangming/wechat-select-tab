// cloudfunctions/createLottery/index.test.js
// createLottery 云函数单元测试

// Mock wx-server-sdk
jest.mock('wx-server-sdk');

const cloud = require('wx-server-sdk');
const { main } = require('./index');

describe('createLottery 云函数', () => {
  let mockDb;
  let mockCollection;
  let mockAdd;
  
  beforeEach(() => {
    // 重置所有 mock
    jest.clearAllMocks();
    
    // 设置数据库 mock
    mockAdd = jest.fn();
    mockCollection = jest.fn(() => ({
      add: mockAdd
    }));
    mockDb = {
      collection: mockCollection
    };
    
    cloud.database.mockReturnValue(mockDb);
    cloud.getWXContext.mockReturnValue({
      OPENID: 'test-openid-123'
    });
  });
  
  describe('参数验证', () => {
    test('应该拒绝空标题', async () => {
      const event = {
        title: '',
        categories: [{ name: '类目1', quantity: 5 }],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toContain('标题不能为空');
    });
    
    test('应该拒绝超过50字符的标题', async () => {
      const event = {
        title: 'a'.repeat(51),
        categories: [{ name: '类目1', quantity: 5 }],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toContain('标题长度不能超过50个字符');
    });
    
    test('应该拒绝空类目数组', async () => {
      const event = {
        title: '测试活动',
        categories: [],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toContain('至少需要一个类目');
    });
    
    test('应该拒绝类目名称为空', async () => {
      const event = {
        title: '测试活动',
        categories: [{ name: '', quantity: 5 }],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toContain('名称不能为空');
    });
    
    test('应该拒绝类目数量不是正整数', async () => {
      const event = {
        title: '测试活动',
        categories: [{ name: '类目1', quantity: 0 }],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toContain('必须是正整数');
    });
    
    test('应该拒绝开始时间晚于结束时间', async () => {
      const event = {
        title: '测试活动',
        categories: [{ name: '类目1', quantity: 5 }],
        startTime: new Date(Date.now() + 7200000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('TIME_RANGE_ERROR');
      expect(result.message).toContain('开始时间必须早于结束时间');
    });
  });
  
  describe('成功创建活动', () => {
    test('应该成功创建活动并返回活动ID', async () => {
      const mockEventId = 'mock-event-id-123';
      mockAdd.mockResolvedValue({ _id: mockEventId });
      
      const event = {
        title: '测试活动',
        categories: [
          { name: '类目1', quantity: 5 },
          { name: '类目2', quantity: 3 }
        ],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(mockEventId);
      expect(result.message).toBe('创建成功');
    });
    
    test('应该正确保存活动数据到数据库', async () => {
      const mockEventId = 'mock-event-id-456';
      mockAdd.mockResolvedValue({ _id: mockEventId });
      
      const event = {
        title: '  测试活动  ',  // 带空格
        categories: [
          { name: '  类目1  ', quantity: 5 }
        ],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      await main(event, {});
      
      expect(mockCollection).toHaveBeenCalledWith('lottery_events');
      expect(mockAdd).toHaveBeenCalledTimes(1);
      
      const savedData = mockAdd.mock.calls[0][0].data;
      expect(savedData.title).toBe('测试活动');  // 应该去除空格
      expect(savedData.categories[0].name).toBe('类目1');  // 应该去除空格
      expect(savedData.categories[0].quantity).toBe(5);
      expect(savedData.categories[0].remaining).toBe(5);  // 初始剩余数量等于总数量
      expect(savedData.creatorId).toBe('test-openid-123');
      expect(savedData.createTime).toBeInstanceOf(Date);
      expect(savedData.startTime).toBeInstanceOf(Date);
      expect(savedData.endTime).toBeInstanceOf(Date);
    });
  });
  
  describe('错误处理', () => {
    test('应该处理数据库错误', async () => {
      mockAdd.mockRejectedValue(new Error('数据库连接失败'));
      
      const event = {
        title: '测试活动',
        categories: [{ name: '类目1', quantity: 5 }],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DATABASE_ERROR');
      expect(result.message).toContain('创建失败');
    });
    
    test('应该处理缺少openid的情况', async () => {
      cloud.getWXContext.mockReturnValue({
        OPENID: null
      });
      
      const event = {
        title: '测试活动',
        categories: [{ name: '类目1', quantity: 5 }],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString()
      };
      
      const result = await main(event, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('PERMISSION_ERROR');
      expect(result.message).toContain('用户身份验证失败');
    });
  });
});
