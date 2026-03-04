// pages/index/index.test.js
const { describe, it, expect, beforeEach } = require('@jest/globals');

describe('Index Page', () => {
  let page;
  let pageConfig;

  beforeEach(() => {
    // 模拟 wx.navigateTo
    global.wx = {
      navigateTo: jest.fn()
    };

    // 模拟 Page 函数
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    // 清除缓存并重新加载页面
    jest.resetModules();
    require('./index.js');

    // 创建页面实例
    page = {
      data: pageConfig.data,
      navigateToCreate: pageConfig.navigateToCreate,
      navigateToHistory: pageConfig.navigateToHistory
    };
  });

  describe('Navigation', () => {
    it('should navigate to create page when navigateToCreate is called', () => {
      page.navigateToCreate();
      
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/create/create'
      });
    });

    it('should navigate to history page when navigateToHistory is called', () => {
      page.navigateToHistory();
      
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/history/history'
      });
    });
  });

  describe('Page Configuration', () => {
    it('should have correct page title in config', () => {
      const config = require('./index.json');
      expect(config.navigationBarTitleText).toBe('抽签小程序');
    });
  });
});
