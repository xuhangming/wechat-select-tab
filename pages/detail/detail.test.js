// pages/detail/detail.test.js
// 详情页面分享功能测试

describe('Detail Page - Share Feature', () => {
  let page;
  let pageConfig;

  beforeEach(() => {
    // 模拟微信 API
    global.wx = {
      navigateBack: jest.fn()
    };

    // 模拟 Page 函数
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    // 清除缓存并重新加载页面
    jest.resetModules();
    require('./detail.js');

    // 创建页面实例
    page = {
      data: {
        eventId: 'test-event-123',
        event: {
          title: '测试抽签活动',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000)
        },
        isCreator: true
      },
      onShareAppMessage: pageConfig.onShareAppMessage,
      onShareTimeline: pageConfig.onShareTimeline
    };
  });

  describe('onShareAppMessage', () => {
    it('should return correct share configuration', () => {
      const shareConfig = page.onShareAppMessage.call(page);
      
      expect(shareConfig).toHaveProperty('title');
      expect(shareConfig).toHaveProperty('path');
      expect(shareConfig.title).toContain('测试抽签活动');
      expect(shareConfig.path).toBe('/pages/detail/detail?id=test-event-123');
    });

    it('should handle missing event data', () => {
      page.data.event = null;
      
      const shareConfig = page.onShareAppMessage.call(page);
      
      expect(shareConfig.title).toContain('抽签活动');
      expect(shareConfig.path).toBe('/pages/detail/detail?id=test-event-123');
    });
  });

  describe('onShareTimeline', () => {
    it('should return correct timeline share configuration', () => {
      const shareConfig = page.onShareTimeline.call(page);
      
      expect(shareConfig).toHaveProperty('title');
      expect(shareConfig).toHaveProperty('query');
      expect(shareConfig.title).toContain('测试抽签活动');
      expect(shareConfig.query).toBe('id=test-event-123');
    });

    it('should handle missing event data', () => {
      page.data.event = null;
      
      const shareConfig = page.onShareTimeline.call(page);
      
      expect(shareConfig.title).toContain('抽签活动');
      expect(shareConfig.query).toBe('id=test-event-123');
    });
  });
});
