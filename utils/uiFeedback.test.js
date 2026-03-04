// utils/uiFeedback.test.js
const uiFeedback = require('./uiFeedback');

// Mock wx API
global.wx = {
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn((options) => {
    if (options.success) {
      options.success({ confirm: true });
    }
  }),
  showActionSheet: jest.fn((options) => {
    if (options.success) {
      options.success({ tapIndex: 0 });
    }
  })
};

describe('uiFeedback - 全局UI反馈组件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showLoading', () => {
    test('应该显示默认加载提示', () => {
      uiFeedback.showLoading();
      
      expect(wx.showLoading).toHaveBeenCalledWith({
        title: '加载中...',
        mask: true
      });
    });

    test('应该显示自定义加载提示', () => {
      uiFeedback.showLoading('正在创建...', false);
      
      expect(wx.showLoading).toHaveBeenCalledWith({
        title: '正在创建...',
        mask: false
      });
    });
  });

  describe('hideLoading', () => {
    test('应该隐藏加载提示', () => {
      uiFeedback.hideLoading();
      
      expect(wx.hideLoading).toHaveBeenCalled();
    });
  });

  describe('showSuccess', () => {
    test('应该显示成功提示', () => {
      uiFeedback.showSuccess('操作成功');
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '操作成功',
        icon: 'success',
        duration: 2000,
        mask: true,
        success: expect.any(Function)
      });
    });

    test('应该支持自定义持续时间', () => {
      uiFeedback.showSuccess('创建成功', 3000);
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '创建成功',
        icon: 'success',
        duration: 3000,
        mask: true,
        success: expect.any(Function)
      });
    });

    test('应该在提示结束后执行回调', (done) => {
      jest.useFakeTimers();
      
      const callback = jest.fn();
      uiFeedback.showSuccess('操作成功', 1000, callback);
      
      // 触发 success 回调
      const successCallback = wx.showToast.mock.calls[0][0].success;
      successCallback();
      
      // 快进时间
      jest.advanceTimersByTime(1000);
      
      expect(callback).toHaveBeenCalled();
      
      jest.useRealTimers();
      done();
    });
  });

  describe('showError', () => {
    test('应该显示错误提示', () => {
      uiFeedback.showError('操作失败');
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '操作失败',
        icon: 'none',
        duration: 2000,
        mask: true,
        success: expect.any(Function)
      });
    });

    test('应该支持自定义持续时间和回调', (done) => {
      jest.useFakeTimers();
      
      const callback = jest.fn();
      uiFeedback.showError('网络错误', 1500, callback);
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '网络错误',
        icon: 'none',
        duration: 1500,
        mask: true,
        success: expect.any(Function)
      });
      
      // 触发 success 回调
      const successCallback = wx.showToast.mock.calls[0][0].success;
      successCallback();
      
      // 快进时间
      jest.advanceTimersByTime(1500);
      
      expect(callback).toHaveBeenCalled();
      
      jest.useRealTimers();
      done();
    });
  });

  describe('showToast', () => {
    test('应该显示普通提示', () => {
      uiFeedback.showToast('提示信息');
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '提示信息',
        icon: 'none',
        duration: 2000,
        mask: true
      });
    });

    test('应该支持自定义持续时间', () => {
      uiFeedback.showToast('提示信息', 3000);
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '提示信息',
        icon: 'none',
        duration: 3000,
        mask: true
      });
    });
  });

  describe('showModal', () => {
    test('应该显示默认模态对话框', async () => {
      const result = await uiFeedback.showModal({
        title: '确认',
        content: '确定要删除吗？'
      });
      
      expect(wx.showModal).toHaveBeenCalledWith({
        title: '确认',
        content: '确定要删除吗？',
        showCancel: true,
        confirmText: '确定',
        cancelText: '取消',
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      
      expect(result).toBe(true);
    });

    test('应该支持自定义按钮文字', async () => {
      await uiFeedback.showModal({
        title: '提示',
        content: '内容',
        showCancel: false,
        confirmText: '知道了',
        cancelText: '返回'
      });
      
      expect(wx.showModal).toHaveBeenCalledWith({
        title: '提示',
        content: '内容',
        showCancel: false,
        confirmText: '知道了',
        cancelText: '返回',
        success: expect.any(Function),
        fail: expect.any(Function)
      });
    });

    test('失败时应该返回false', async () => {
      wx.showModal.mockImplementationOnce((options) => {
        if (options.fail) {
          options.fail();
        }
      });
      
      const result = await uiFeedback.showModal({
        title: '测试',
        content: '测试内容'
      });
      
      expect(result).toBe(false);
    });
  });

  describe('showActionSheet', () => {
    test('应该显示操作菜单', async () => {
      const items = ['选项1', '选项2', '选项3'];
      const result = await uiFeedback.showActionSheet(items);
      
      expect(wx.showActionSheet).toHaveBeenCalledWith({
        itemList: items,
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      
      expect(result).toBe(0);
    });

    test('取消时应该返回-1', async () => {
      wx.showActionSheet.mockImplementationOnce((options) => {
        if (options.fail) {
          options.fail();
        }
      });
      
      const result = await uiFeedback.showActionSheet(['选项1', '选项2']);
      
      expect(result).toBe(-1);
    });
  });

  describe('防止重复操作', () => {
    test('加载提示应该使用mask防止触摸穿透', () => {
      uiFeedback.showLoading('处理中...');
      
      const callArgs = wx.showLoading.mock.calls[0][0];
      expect(callArgs.mask).toBe(true);
    });

    test('成功提示应该使用mask防止重复点击', () => {
      uiFeedback.showSuccess('操作成功');
      
      const callArgs = wx.showToast.mock.calls[0][0];
      expect(callArgs.mask).toBe(true);
    });

    test('错误提示应该使用mask防止重复点击', () => {
      uiFeedback.showError('操作失败');
      
      const callArgs = wx.showToast.mock.calls[0][0];
      expect(callArgs.mask).toBe(true);
    });
  });
});
