// utils/uiFeedback.js
// 全局UI反馈组件 - 统一管理加载提示、成功提示和错误提示

/**
 * 显示加载提示
 * @param {String} title - 提示文字，默认"加载中..."
 * @param {Boolean} mask - 是否显示透明蒙层，防止触摸穿透，默认true
 */
const showLoading = (title = '加载中...', mask = true) => {
  wx.showLoading({
    title,
    mask
  });
};

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 显示成功提示
 * @param {String} title - 提示文字
 * @param {Number} duration - 提示持续时间（毫秒），默认2000
 * @param {Function} callback - 提示结束后的回调函数
 */
const showSuccess = (title, duration = 2000, callback) => {
  wx.showToast({
    title,
    icon: 'success',
    duration,
    mask: true,
    success: () => {
      if (callback) {
        setTimeout(callback, duration);
      }
    }
  });
};

/**
 * 显示错误提示
 * @param {String} title - 错误提示文字
 * @param {Number} duration - 提示持续时间（毫秒），默认2000
 * @param {Function} callback - 提示结束后的回调函数
 */
const showError = (title, duration = 2000, callback) => {
  wx.showToast({
    title,
    icon: 'none',
    duration,
    mask: true,
    success: () => {
      if (callback) {
        setTimeout(callback, duration);
      }
    }
  });
};

/**
 * 显示普通提示（无图标）
 * @param {String} title - 提示文字
 * @param {Number} duration - 提示持续时间（毫秒），默认2000
 */
const showToast = (title, duration = 2000) => {
  wx.showToast({
    title,
    icon: 'none',
    duration,
    mask: true
  });
};

/**
 * 显示模态对话框
 * @param {Object} options - 配置选项
 * @param {String} options.title - 标题
 * @param {String} options.content - 内容
 * @param {Boolean} options.showCancel - 是否显示取消按钮，默认true
 * @param {String} options.confirmText - 确认按钮文字，默认"确定"
 * @param {String} options.cancelText - 取消按钮文字，默认"取消"
 * @returns {Promise<Boolean>} 返回用户是否点击确认
 */
const showModal = (options) => {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
};

/**
 * 显示操作菜单
 * @param {Array<String>} itemList - 按钮文字数组
 * @returns {Promise<Number>} 返回用户点击的按钮索引，取消返回-1
 */
const showActionSheet = (itemList) => {
  return new Promise((resolve) => {
    wx.showActionSheet({
      itemList,
      success: (res) => {
        resolve(res.tapIndex);
      },
      fail: () => {
        resolve(-1);
      }
    });
  });
};

module.exports = {
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showToast,
  showModal,
  showActionSheet
};
