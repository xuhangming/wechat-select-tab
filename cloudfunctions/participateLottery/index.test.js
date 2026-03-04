// cloudfunctions/participateLottery/index.test.js
// 参与抽签云函数单元测试

const cloud = require('wx-server-sdk');

// Mock wx-server-sdk
jest.mock('wx-server-sdk', () => {
  const mockDb = {
    collection: jest.fn(),
    command: {
      inc: jest.fn((value) => ({ _inc: value }))
    }
  };
  
  return {
    init: jest.fn(),
    database: jest.fn(() => mockDb),
    getWXContext: jest.fn(),
    DYNAMIC_CURRENT_ENV: 'test-env'
  };
});

// 导入被测试的函数
const { main } = require('./index');

describe('participateLottery 云函数', () => {
  let mockDb;
  let mockCollection;
  let mockDoc;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置数据库 mock
    mockDb = cloud.database();
    mockCollection = {
      doc: jest.fn(),
      where: jest.fn(),
      add: jest.fn(),
      get: jest.fn(),
      count: jest.fn(),
      update: jest.fn()
    };
    mockDoc = {
      get: jest.fn(),
      update: jest.fn()
    };
    
    mockDb.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDoc);
    mockCollection.where.mockReturnValue(mockCollection);
  });
  
  describe('输入验证', () => {
    test('应该拒绝空的 eventId', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const result = await main({ eventId: '' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('活动ID不能为空');
    });
    
    test('应该拒绝缺少 openid 的请求', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: null });
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('PERMISSION_ERROR');
      expect(result.message).toBe('用户身份验证失败');
    });
  });
  
  describe('活动查询', () => {
    test('应该拒绝不存在的活动', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      mockDoc.get.mockResolvedValue({ data: null });
      
      const result = await main({ eventId: 'non-existent' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('NOT_FOUND_ERROR');
      expect(result.message).toBe('活动不存在');
    });
  });
  
  describe('时间范围验证', () => {
    test('应该拒绝尚未开始的活动', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const futureStart = new Date(Date.now() + 3600000); // 1小时后
      const futureEnd = new Date(Date.now() + 7200000);   // 2小时后
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [{ name: '类目A', quantity: 10, remaining: 10 }],
          startTime: futureStart,
          endTime: futureEnd,
          creatorId: 'creator-123'
        }
      });
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('TIME_RANGE_ERROR');
      expect(result.message).toBe('活动尚未开始');
    });
    
    test('应该拒绝已结束的活动', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const pastStart = new Date(Date.now() - 7200000);  // 2小时前
      const pastEnd = new Date(Date.now() - 3600000);    // 1小时前
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [{ name: '类目A', quantity: 10, remaining: 10 }],
          startTime: pastStart,
          endTime: pastEnd,
          creatorId: 'creator-123'
        }
      });
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('TIME_RANGE_ERROR');
      expect(result.message).toBe('活动已结束');
    });
  });
  
  describe('重复参与检查', () => {
    test('应该拒绝重复参与', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000);  // 1小时前
      const endTime = new Date(now.getTime() + 3600000);    // 1小时后
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [{ name: '类目A', quantity: 10, remaining: 10 }],
          startTime: startTime,
          endTime: endTime,
          creatorId: 'creator-123'
        }
      });
      
      // 模拟用户已参与
      mockCollection.count.mockResolvedValue({ total: 1 });
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DUPLICATE_ERROR');
      expect(result.message).toBe('您已参与过此次抽签');
    });
  });
  
  describe('类目已满检查', () => {
    test('应该拒绝所有类目已满的活动', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000);
      const endTime = new Date(now.getTime() + 3600000);
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [
            { name: '类目A', quantity: 10, remaining: 0 },
            { name: '类目B', quantity: 5, remaining: 0 }
          ],
          startTime: startTime,
          endTime: endTime,
          creatorId: 'creator-123'
        }
      });
      
      mockCollection.count.mockResolvedValue({ total: 0 });
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('CAPACITY_ERROR');
      expect(result.message).toBe('抽签名额已满');
    });
  });
  
  describe('成功参与抽签', () => {
    test('应该成功分配类目并保存结果', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000);
      const endTime = new Date(now.getTime() + 3600000);
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [
            { name: '类目A', quantity: 10, remaining: 5 },
            { name: '类目B', quantity: 5, remaining: 3 }
          ],
          startTime: startTime,
          endTime: endTime,
          creatorId: 'creator-123'
        }
      });
      
      mockCollection.count.mockResolvedValue({ total: 0 });
      mockDoc.update.mockResolvedValue({ stats: { updated: 1 } });
      mockCollection.add.mockResolvedValue({ _id: 'result-123' });
      
      const result = await main({ 
        eventId: 'event-123',
        userInfo: {
          avatarUrl: 'https://test.com/avatar.jpg',
          nickName: '测试用户'
        }
      }, {});
      
      expect(result.success).toBe(true);
      expect(result.category).toBeDefined();
      expect(['类目A', '类目B']).toContain(result.category);
      expect(result.message).toBe('抽签成功');
      
      // 验证更新了类目数量
      expect(mockDoc.update).toHaveBeenCalled();
      
      // 验证保存了抽签结果
      expect(mockCollection.add).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: 'event-123',
          userId: 'test-user-123',
          userInfo: {
            avatarUrl: 'https://test.com/avatar.jpg',
            nickName: '测试用户'
          },
          category: expect.any(String),
          createTime: expect.any(Date)
        })
      });
    });
    
    test('应该只从剩余数量大于0的类目中选择', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000);
      const endTime = new Date(now.getTime() + 3600000);
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [
            { name: '类目A', quantity: 10, remaining: 0 },  // 已满
            { name: '类目B', quantity: 5, remaining: 3 }    // 可用
          ],
          startTime: startTime,
          endTime: endTime,
          creatorId: 'creator-123'
        }
      });
      
      mockCollection.count.mockResolvedValue({ total: 0 });
      mockDoc.update.mockResolvedValue({ stats: { updated: 1 } });
      mockCollection.add.mockResolvedValue({ _id: 'result-123' });
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(true);
      expect(result.category).toBe('类目B');  // 只能选择类目B
    });
  });
  
  describe('数据库错误处理', () => {
    test('应该处理更新失败的情况', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      
      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000);
      const endTime = new Date(now.getTime() + 3600000);
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: 'event-123',
          title: '测试活动',
          categories: [{ name: '类目A', quantity: 10, remaining: 5 }],
          startTime: startTime,
          endTime: endTime,
          creatorId: 'creator-123'
        }
      });
      
      mockCollection.count.mockResolvedValue({ total: 0 });
      mockDoc.update.mockResolvedValue({ stats: { updated: 0 } });  // 更新失败
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DATABASE_ERROR');
      expect(result.message).toBe('抽签失败，请重试');
    });
    
    test('应该处理数据库异常', async () => {
      cloud.getWXContext.mockReturnValue({ OPENID: 'test-user-123' });
      mockDoc.get.mockRejectedValue(new Error('数据库连接失败'));
      
      const result = await main({ eventId: 'event-123' }, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DATABASE_ERROR');
      expect(result.message).toBe('参与失败，请稍后重试');
    });
  });
});
