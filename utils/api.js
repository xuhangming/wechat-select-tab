// utils/api.js
// API调用封装层 - 封装所有云函数调用，实现统一的错误处理和加载状态管理

const { ErrorTypes } = require('./errorHandler');
const uiFeedback = require('./uiFeedback');

/**
 * 统一的云函数调用封装
 * @param {String} functionName - 云函数名称
 * @param {Object} data - 请求数据
 * @param {Object} options - 可选配置
 * @param {Boolean} options.showLoading - 是否显示加载提示，默认 true
 * @param {String} options.loadingText - 加载提示文字，默认 "加载中..."
 * @param {Boolean} options.showError - 是否显示错误提示，默认 true
 * @returns {Promise} 返回云函数结果
 */
const callCloudFunction = async (functionName, data = {}, options = {}) => {
  const {
    showLoading = true,
    loadingText = '加载中...',
    showError = true
  } = options;
  
  // 显示加载提示
  if (showLoading) {
    uiFeedback.showLoading(loadingText, true);
  }
  
  try {
    // 调用云函数
    const res = await wx.cloud.callFunction({
      name: functionName,
      data: data
    });
    
    // 隐藏加载提示
    if (showLoading) {
      uiFeedback.hideLoading();
    }
    
    // 检查云函数返回结果
    if (!res.result) {
      throw new Error('云函数返回结果为空');
    }
    
    const result = res.result;
    
    // 如果云函数返回失败
    if (result.success === false) {
      // 显示错误提示
      if (showError) {
        showErrorToast(result);
      }
      return result;
    }
    
    // 返回成功结果
    return result;
    
  } catch (error) {
    // 隐藏加载提示
    if (showLoading) {
      uiFeedback.hideLoading();
    }
    
    console.error(`云函数 ${functionName} 调用失败:`, error);
    
    // 构造网络错误响应
    const errorResponse = {
      success: false,
      errorType: ErrorTypes.NETWORK_ERROR,
      message: '网络连接失败，请重试'
    };
    
    // 显示错误提示
    if (showError) {
      showErrorToast(errorResponse);
    }
    
    return errorResponse;
  }
};

/**
 * 显示错误提示
 * @param {Object} errorResult - 错误结果对象
 */
const showErrorToast = (errorResult) => {
  const message = errorResult.message || '操作失败，请重试';
  uiFeedback.showError(message);
};

/**
 * 显示成功提示
 * @param {String} message - 成功消息
 */
const showSuccessToast = (message) => {
  uiFeedback.showSuccess(message);
};

/**
 * 创建抽签活动
 * @param {Object} data - 活动数据
 * @param {String} data.title - 抽签标题
 * @param {Array} data.categories - 类目列表 [{name, quantity}]
 * @param {Date} data.startTime - 开始时间
 * @param {Date} data.endTime - 结束时间
 * @returns {Promise} 返回包含 eventId 的结果
 */
const createLottery = async (data) => {
  return await callCloudFunction('createLottery', data, {
    loadingText: '创建中...',
    showLoading: true,
    showError: true
  });
};

/**
 * 参与抽签
 * @param {String} eventId - 活动ID
 * @param {Object} userInfo - 用户信息（头像、昵称）
 * @returns {Promise} 返回包含 category 的结果
 */
const participateLottery = async (eventId, userInfo = {}) => {
  return await callCloudFunction('participateLottery', { eventId, userInfo }, {
    loadingText: '抽签中...',
    showLoading: true,
    showError: true
  });
};

/**
 * 获取抽签列表
 * @returns {Promise} 返回包含 list 的结果
 */
const getLotteryList = async () => {
  return await callCloudFunction('getLotteryList', {}, {
    loadingText: '加载中...',
    showLoading: true,
    showError: true
  });
};

/**
 * 获取抽签详情
 * @param {String} eventId - 活动ID
 * @returns {Promise} 返回包含 event 和 results 的结果
 */
const getLotteryDetail = async (eventId) => {
  return await callCloudFunction('getLotteryDetail', { eventId }, {
    loadingText: '加载中...',
    showLoading: true,
    showError: true
  });
};

/**
 * 获取我参与的抽签列表
 * @returns {Promise} 返回包含 list 的结果
 */
const getMyParticipatedLotteries = async () => {
  return await callCloudFunction('getMyParticipatedLotteries', {}, {
    loadingText: '加载中...',
    showLoading: false,
    showError: true
  });
};

module.exports = {
  createLottery,
  participateLottery,
  getLotteryList,
  getLotteryDetail,
  getMyParticipatedLotteries,
  showSuccessToast,
  showErrorToast
};
