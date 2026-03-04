// cloudfunctions/getLotteryList/index.test.js
// getLotteryList 云函数单元测试

// Mock wx-server-sdk
jest.mock('wx-server-sdk');

const cloud = require('wx-server-sdk');
const { main } = require('./index');

describe('getLotteryList 云函数', () => {
  let mockDb;
  let mockCollection;
  let mockWhere;
  let mockOrderBy;
  let mockGet;
  
  beforeEach(() => {
    // 重置所有 mock
    jest.clearAllMocks();
    
    // 设置数据库 mock 链
    mockGet = jest.fn();
    mockOrderBy = jest.fn(() => ({
      get: mockGet
    }));
    mockWhere = jest.fn(() => ({
      orderBy: mockOrderBy
    }));
    mockCollection = jest.fn(() => ({
      where: mockWhere
    }));
    mockDb = {
      collection: mockCollection
    };
    
    cloud.database.mockReturnValue(mockDb);
    cloud.getWXContext.mockReturnValue({
      OPENID: 'test-openid-123'
    });
  });
  
  describe('成功查询活动列表', () => {
    test('应该返回用户创建的活动列表', async () => {
      const now = new Date();
      const mockEvents = [
        {
          _id: 'event-1',
          title: '活动1',
          startTime: new Date(now.getTime() - 3600000),
          endTime: new Date(now.getTime() + 3600000),
          createTime: new Date(now.getTime() - 7200000),
          creatorId: 'test-openid-123'
        },
        {
          _id: 'event-2',
          title: '活动2',
          startTime: new Date(now.getTime() + 3600000),
          endTime: new Date(now.getTime() + 7200000),
          createTime: new Date(now.getTime() - 10800000),
          creatorId: 'test-openid-123'
        }
      ];
      
      mockGet.mockResolvedValue({ data: mockEvents });
      
      const result = await main({}, {});
      
      expect(result.success).toBe(true);
      expect(result.list).toHaveLength(2);
      expect(result.list[0]._id).toBe('event-1');
      expect(result.list[0].title).toBe('活动1');
      expect(result.list[0].status).toBe('ongoing');
      expect(result.list[1]._id).toBe('event-2');
      expect(result.list[1].status).toBe('pending');
    });
    
    test('应该按创建时间倒序排序', async () => {
      mockGet.mockResolvedValue({ data: [] });
      
      await main({}, {});
      
      expect(mockCollection).toHaveBeenCalledWith('lottery_events');
      expect(mockWhere).toHaveBeenCalledWith({ creatorId: 'test-openid-123' });
      expect(mockOrderBy).toHaveBeenCalledWith('createTime', 'desc');
    });
    
    test('应该返回空列表当用户没有创建活动', async () => {
      mockGet.mockResolvedValue({ data: [] });
      
      const result = await main({}, {});
      
      expect(result.success).toBe(true);
      expect(result.list).toEqual([]);
    });
    
    test('应该正确计算活动状态 - ongoing', async () => {
      const now = new Date();
      const mockEvents = [{
        _id: 'event-1',
        title: '进行中的活动',
        startTime: new Date(now.getTime() - 3600000),
        endTime: new Date(now.getTime() + 3600000),
        createTime: new Date(now.getTime() - 7200000),
        creatorId: 'test-openid-123'
      }];
      
      mockGet.mockResolvedValue({ data: mockEvents });
      
      const result = await main({}, {});
      
      expect(result.list[0].status).toBe('ongoing');
    });
    
    test('应该正确计算活动状态 - pending', async () => {
      const now = new Date();
      const mockEvents = [{
        _id: 'event-1',
        title: '未开始的活动',
        startTime: new Date(now.getTime() + 3600000),
        endTime: new Date(now.getTime() + 7200000),
        createTime: new Date(now.getTime() - 7200000),
        creatorId: 'test-openid-123'
      }];
      
      mockGet.mockResolvedValue({ data: mockEvents });
      
      const result = await main({}, {});
      
      expect(result.list[0].status).toBe('pending');
    });
    
    test('应该正确计算活动状态 - ended', async () => {
      const now = new Date();
      const mockEvents = [{
        _id: 'event-1',
        title: '已结束的活动',
        startTime: new Date(now.getTime() - 7200000),
        endTime: new Date(now.getTime() - 3600000),
        createTime: new Date(now.getTime() - 10800000),
        creatorId: 'test-openid-123'
      }];
      
      mockGet.mockResolvedValue({ data: mockEvents });
      
      const result = await main({}, {});
      
      expect(result.list[0].status).toBe('ended');
    });
    
    test('应该返回活动基本信息字段', async () => {
      const now = new Date();
      const mockEvents = [{
        _id: 'event-1',
        title: '测试活动',
        startTime: new Date(now.getTime() + 3600000),
        endTime: new Date(now.getTime() + 7200000),
        createTime: new Date(now.getTime() - 7200000),
        creatorId: 'test-openid-123',
        categories: [{ name: '类目1', quantity: 5 }]  // 不应该返回
      }];
      
      mockGet.mockResolvedValue({ data: mockEvents });
      
      const result = await main({}, {});
      
      expect(result.list[0]).toHaveProperty('_id');
      expect(result.list[0]).toHaveProperty('title');
      expect(result.list[0]).toHaveProperty('startTime');
      expect(result.list[0]).toHaveProperty('endTime');
      expect(result.list[0]).toHaveProperty('createTime');
      expect(result.list[0]).toHaveProperty('status');
      expect(result.list[0]).toHaveProperty('categories');
      expect(result.list[0]).not.toHaveProperty('creatorId');
    });
  });
  
  describe('错误处理', () => {
    test('应该处理数据库错误', async () => {
      mockGet.mockRejectedValue(new Error('数据库连接失败'));
      
      const result = await main({}, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DATABASE_ERROR');
      expect(result.message).toContain('查询失败');
    });
    
    test('应该处理缺少openid的情况', async () => {
      cloud.getWXContext.mockReturnValue({
        OPENID: null
      });
      
      const result = await main({}, {});
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('PERMISSION_ERROR');
      expect(result.message).toContain('用户身份验证失败');
    });
  });
  
  describe('用户活动隔离', () => {
    test('应该只查询当前用户创建的活动', async () => {
      mockGet.mockResolvedValue({ data: [] });
      
      await main({}, {});
      
      expect(mockWhere).toHaveBeenCalledWith({
        creatorId: 'test-openid-123'
      });
    });
    
    test('不同用户应该看到不同的活动列表', async () => {
      // 用户1
      cloud.getWXContext.mockReturnValue({
        OPENID: 'user-1'
      });
      
      await main({}, {});
      expect(mockWhere).toHaveBeenCalledWith({ creatorId: 'user-1' });
      
      // 用户2
      cloud.getWXContext.mockReturnValue({
        OPENID: 'user-2'
      });
      
      await main({}, {});
      expect(mockWhere).toHaveBeenCalledWith({ creatorId: 'user-2' });
    });
  });
});
