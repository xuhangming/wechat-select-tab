// cloudfunctions/getLotteryDetail/index.test.js
// getLotteryDetail 云函数单元测试

const cloud = require('wx-server-sdk');

// Mock wx-server-sdk
jest.mock('wx-server-sdk', () => {
  const mockDb = {
    collection: jest.fn(),
    command: {}
  };
  
  return {
    init: jest.fn(),
    database: jest.fn(() => mockDb),
    getWXContext: jest.fn(),
    DYNAMIC_CURRENT_ENV: 'test-env'
  };
});

describe('getLotteryDetail 云函数', () => {
  let mockDb;
  let mockCollection;
  let mockDoc;
  let mockWhere;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置 mock
    mockDoc = {
      get: jest.fn()
    };
    
    mockWhere = {
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn(),
      count: jest.fn()
    };
    
    mockCollection = {
      doc: jest.fn(() => mockDoc),
      where: jest.fn(() => mockWhere)
    };
    
    mockDb = {
      collection: jest.fn(() => mockCollection)
    };
    
    cloud.database.mockReturnValue(mockDb);
    cloud.getWXContext.mockReturnValue({
      OPENID: 'test-user-openid'
    });
  });
  
  describe('输入验证', () => {
    test('应该拒绝空的 eventId', async () => {
      const getLotteryDetail = require('./index');
      const event = {};
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('活动ID不能为空');
    });
  });
  
  describe('权限验证', () => {
    test('创建者应该能够查看活动详情', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      
      // Mock 活动数据
      mockDoc.get.mockResolvedValue({
        data: {
          _id: eventId,
          title: '测试活动',
          categories: [
            { name: '类目1', quantity: 5, remaining: 3 }
          ],
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31'),
          creatorId: userId
        }
      });
      
      // Mock 抽签结果
      mockWhere.get.mockResolvedValue({
        data: []
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event.title).toBe('测试活动');
      expect(result.results).toEqual([]);
    });
    
    test('参与者应该能够查看活动详情', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      const creatorId = 'creator-openid';
      
      // Mock 活动数据
      mockDoc.get.mockResolvedValue({
        data: {
          _id: eventId,
          title: '测试活动',
          categories: [
            { name: '类目1', quantity: 5, remaining: 3 }
          ],
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31'),
          creatorId: creatorId
        }
      });
      
      // Mock 权限检查 - 用户是参与者
      mockWhere.count.mockResolvedValue({
        total: 1
      });
      
      // Mock 抽签结果
      mockWhere.get.mockResolvedValue({
        data: [
          {
            userId: userId,
            category: '类目1',
            createTime: new Date('2024-06-01')
          }
        ]
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.results).toHaveLength(1);
      expect(result.results[0].category).toBe('类目1');
    });
    
    test('非创建者且非参与者也可以查看活动详情', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      const creatorId = 'creator-openid';
      
      // Mock 活动数据
      mockDoc.get.mockResolvedValue({
        data: {
          _id: eventId,
          title: '测试活动',
          categories: [
            { name: '类目1', quantity: 5, remaining: 3 }
          ],
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31'),
          creatorId: creatorId
        }
      });
      
      // Mock 抽签结果查询 - 没有结果
      mockWhere.orderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: []
        })
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.results).toHaveLength(0);
      expect(result.isCreator).toBe(false);
      expect(result.hasParticipated).toBe(false);
    });
  });
  
  describe('活动查询', () => {
    test('应该返回完整的活动信息', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      
      const mockEvent = {
        _id: eventId,
        title: '测试活动',
        categories: [
          { name: '类目1', quantity: 5, remaining: 3 },
          { name: '类目2', quantity: 10, remaining: 8 }
        ],
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-12-31'),
        creatorId: userId
      };
      
      mockDoc.get.mockResolvedValue({
        data: mockEvent
      });
      
      mockWhere.get.mockResolvedValue({
        data: []
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.event._id).toBe(eventId);
      expect(result.event.title).toBe('测试活动');
      expect(result.event.categories).toHaveLength(2);
      expect(result.event.startTime).toEqual(mockEvent.startTime);
      expect(result.event.endTime).toEqual(mockEvent.endTime);
      expect(result.event.creatorId).toBe(userId);
    });
    
    test('应该返回所有抽签结果', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: eventId,
          title: '测试活动',
          categories: [
            { name: '类目1', quantity: 5, remaining: 3 }
          ],
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31'),
          creatorId: userId
        }
      });
      
      const mockResults = [
        {
          userId: 'user1',
          category: '类目1',
          createTime: new Date('2024-06-01')
        },
        {
          userId: 'user2',
          category: '类目1',
          createTime: new Date('2024-06-02')
        },
        {
          userId: 'user3',
          category: '类目1',
          createTime: new Date('2024-06-03')
        }
      ];
      
      mockWhere.get.mockResolvedValue({
        data: mockResults
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3);
      expect(result.results[0].userId).toBe('user1');
      expect(result.results[1].userId).toBe('user2');
      expect(result.results[2].userId).toBe('user3');
    });
    
    test('应该返回参与者的用户信息（头像和昵称）', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: eventId,
          title: '测试活动',
          description: '测试描述',
          categories: [
            { name: '类目1', quantity: 5, remaining: 3 }
          ],
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31'),
          creatorId: userId
        }
      });
      
      const mockResults = [
        {
          userId: 'user1',
          category: '类目1',
          userInfo: {
            avatarUrl: 'https://example.com/avatar1.jpg',
            nickName: '用户1'
          },
          createTime: new Date('2024-06-01')
        },
        {
          userId: 'user2',
          category: '类目1',
          userInfo: {
            avatarUrl: 'https://example.com/avatar2.jpg',
            nickName: '用户2'
          },
          createTime: new Date('2024-06-02')
        }
      ];
      
      mockWhere.get.mockResolvedValue({
        data: mockResults
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.event.description).toBe('测试描述');
      expect(result.results).toHaveLength(2);
      expect(result.results[0].userInfo).toBeDefined();
      expect(result.results[0].userInfo.avatarUrl).toBe('https://example.com/avatar1.jpg');
      expect(result.results[0].userInfo.nickName).toBe('用户1');
      expect(result.results[1].userInfo).toBeDefined();
      expect(result.results[1].userInfo.avatarUrl).toBe('https://example.com/avatar2.jpg');
      expect(result.results[1].userInfo.nickName).toBe('用户2');
    });
    
    test('活动不存在时应该返回错误', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'non-existent-id';
      
      mockDoc.get.mockResolvedValue({
        data: null
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('NOT_FOUND_ERROR');
      expect(result.message).toBe('活动不存在');
    });
  });
  
  describe('错误处理', () => {
    test('数据库错误应该返回标准错误响应', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      
      mockDoc.get.mockRejectedValue(new Error('数据库连接失败'));
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DATABASE_ERROR');
      expect(result.message).toBe('查询失败，请稍后重试');
    });
    
    test('无法获取用户 openid 时应该返回权限错误', async () => {
      cloud.getWXContext.mockReturnValue({
        OPENID: null
      });
      
      const getLotteryDetail = require('./index');
      
      const event = { eventId: 'test-event-id' };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('PERMISSION_ERROR');
      expect(result.message).toBe('用户身份验证失败');
    });
  });
  
  describe('类目统计', () => {
    test('应该正确返回类目的总数量和剩余数量', async () => {
      const getLotteryDetail = require('./index');
      const eventId = 'test-event-id';
      const userId = 'test-user-openid';
      
      mockDoc.get.mockResolvedValue({
        data: {
          _id: eventId,
          title: '测试活动',
          categories: [
            { name: '类目1', quantity: 5, remaining: 2 },
            { name: '类目2', quantity: 10, remaining: 10 },
            { name: '类目3', quantity: 3, remaining: 0 }
          ],
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31'),
          creatorId: userId
        }
      });
      
      mockWhere.get.mockResolvedValue({
        data: []
      });
      
      const event = { eventId };
      const context = {};
      
      const result = await getLotteryDetail.main(event, context);
      
      expect(result.success).toBe(true);
      expect(result.event.categories).toHaveLength(3);
      expect(result.event.categories[0]).toEqual({
        name: '类目1',
        quantity: 5,
        remaining: 2
      });
      expect(result.event.categories[1]).toEqual({
        name: '类目2',
        quantity: 10,
        remaining: 10
      });
      expect(result.event.categories[2]).toEqual({
        name: '类目3',
        quantity: 3,
        remaining: 0
      });
    });
  });
});
