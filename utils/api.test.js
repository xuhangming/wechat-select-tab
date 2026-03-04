// utils/api.test.js
// API调用封装层的单元测试

const { ErrorTypes } = require('./errorHandler');

// 模拟微信小程序 API
global.wx = {
  cloud: {
    callFunction: jest.fn()
  },
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showToast: jest.fn()
};

// 在每个测试前重置模拟
beforeEach(() => {
  jest.clearAllMocks();
});

describe('API 调用封装层', () => {
  // 动态导入 api 模块，确保使用模拟的 wx
  let api;
  
  beforeAll(() => {
    api = require('./api');
  });
  
  describe('统一错误处理', () => {
    test('应该处理云函数返回的业务错误', async () => {
      // 模拟云函数返回业务错误
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: false,
          errorType: ErrorTypes.VALIDATION_ERROR,
          message: '标题不能为空'
        }
      });
      
      const result = await api.createLottery({ title: '' });
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorTypes.VALIDATION_ERROR);
      expect(result.message).toBe('标题不能为空');
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '标题不能为空',
          icon: 'none',
          duration: 2000
        })
      );
    });
    
    test('应该处理网络错误', async () => {
      // 模拟网络错误
      wx.cloud.callFunction.mockRejectedValue(new Error('Network error'));
      
      const result = await api.createLottery({ title: '测试' });
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorTypes.NETWORK_ERROR);
      expect(result.message).toBe('网络连接失败，请重试');
      expect(wx.showToast).toHaveBeenCalled();
    });
    
    test('应该处理云函数返回结果为空的情况', async () => {
      // 模拟云函数返回空结果
      wx.cloud.callFunction.mockResolvedValue({});
      
      const result = await api.createLottery({ title: '测试' });
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorTypes.NETWORK_ERROR);
    });
  });
  
  describe('加载状态管理', () => {
    test('应该在调用云函数时显示加载提示', async () => {
      wx.cloud.callFunction.mockResolvedValue({
        result: { success: true, eventId: '123' }
      });
      
      await api.createLottery({ title: '测试' });
      
      expect(wx.showLoading).toHaveBeenCalledWith({
        title: '创建中...',
        mask: true
      });
      expect(wx.hideLoading).toHaveBeenCalled();
    });
    
    test('应该在云函数调用失败后隐藏加载提示', async () => {
      wx.cloud.callFunction.mockRejectedValue(new Error('Network error'));
      
      await api.createLottery({ title: '测试' });
      
      expect(wx.showLoading).toHaveBeenCalled();
      expect(wx.hideLoading).toHaveBeenCalled();
    });
    
    test('应该在云函数返回业务错误后隐藏加载提示', async () => {
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: false,
          errorType: ErrorTypes.VALIDATION_ERROR,
          message: '验证失败'
        }
      });
      
      await api.createLottery({ title: '' });
      
      expect(wx.showLoading).toHaveBeenCalled();
      expect(wx.hideLoading).toHaveBeenCalled();
    });
  });
  
  describe('createLottery', () => {
    test('应该成功创建抽签活动', async () => {
      const mockEventId = 'event_123';
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          eventId: mockEventId,
          message: '创建成功'
        }
      });
      
      const data = {
        title: '测试抽签',
        categories: [{ name: '类目1', quantity: 10 }],
        startTime: new Date(),
        endTime: new Date()
      };
      
      const result = await api.createLottery(data);
      
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(mockEventId);
      expect(wx.cloud.callFunction).toHaveBeenCalledWith({
        name: 'createLottery',
        data: data
      });
    });
  });
  
  describe('participateLottery', () => {
    test('应该成功参与抽签', async () => {
      const mockCategory = '类目1';
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          category: mockCategory,
          message: '抽签成功'
        }
      });
      
      const eventId = 'event_123';
      const userInfo = { avatarUrl: 'test.jpg', nickName: '测试用户' };
      const result = await api.participateLottery(eventId, userInfo);
      
      expect(result.success).toBe(true);
      expect(result.category).toBe(mockCategory);
      expect(wx.cloud.callFunction).toHaveBeenCalledWith({
        name: 'participateLottery',
        data: { eventId, userInfo }
      });
    });
    
    test('应该处理重复参与错误', async () => {
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: false,
          errorType: ErrorTypes.DUPLICATE_ERROR,
          message: '您已参与过此次抽签'
        }
      });
      
      const result = await api.participateLottery('event_123');
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(ErrorTypes.DUPLICATE_ERROR);
    });
  });
  
  describe('getLotteryList', () => {
    test('应该成功获取抽签列表', async () => {
      const mockList = [
        { _id: '1', title: '抽签1', status: 'ongoing' },
        { _id: '2', title: '抽签2', status: 'ended' }
      ];
      
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          list: mockList
        }
      });
      
      const result = await api.getLotteryList();
      
      expect(result.success).toBe(true);
      expect(result.list).toEqual(mockList);
      expect(wx.cloud.callFunction).toHaveBeenCalledWith({
        name: 'getLotteryList',
        data: {}
      });
    });
  });
  
  describe('getLotteryDetail', () => {
    test('应该成功获取抽签详情', async () => {
      const mockEvent = {
        _id: 'event_123',
        title: '测试抽签',
        categories: [{ name: '类目1', quantity: 10, remaining: 5 }]
      };
      const mockResults = [
        { userId: 'user1', category: '类目1' }
      ];
      
      wx.cloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          event: mockEvent,
          results: mockResults
        }
      });
      
      const result = await api.getLotteryDetail('event_123');
      
      expect(result.success).toBe(true);
      expect(result.event).toEqual(mockEvent);
      expect(result.results).toEqual(mockResults);
    });
  });
  
  describe('辅助函数', () => {
    test('showSuccessToast 应该显示成功提示', () => {
      api.showSuccessToast('操作成功');
      
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '操作成功',
          icon: 'success',
          duration: 2000
        })
      );
    });
    
    test('showErrorToast 应该显示错误提示', () => {
      const errorResult = {
        success: false,
        errorType: ErrorTypes.VALIDATION_ERROR,
        message: '验证失败'
      };
      
      api.showErrorToast(errorResult);
      
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '验证失败',
          icon: 'none',
          duration: 2000
        })
      );
    });
    
    test('showErrorToast 应该使用默认消息', () => {
      const errorResult = {
        success: false,
        errorType: ErrorTypes.DATABASE_ERROR
      };
      
      api.showErrorToast(errorResult);
      
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '操作失败，请重试',
          icon: 'none',
          duration: 2000
        })
      );
    });
  });
});
