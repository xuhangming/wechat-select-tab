// cloudfunctions/participateLottery/index.js
// 参与抽签云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 验证时间范围
 * 检查当前时间是否在活动的开始时间和结束时间之间
 */
const validateTimeRange = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now < start) {
    return { valid: false, error: '活动尚未开始' };
  }
  if (now > end) {
    return { valid: false, error: '活动已结束' };
  }
  return { valid: true, error: null };
};

/**
 * 检查用户是否已参与
 */
const checkDuplicateParticipation = async (db, eventId, userId) => {
  const result = await db.collection('lottery_results')
    .where({
      eventId: eventId,
      userId: userId
    })
    .count();
  
  return result.total > 0;
};

/**
 * 获取可用类目（剩余数量 > 0）
 */
const getAvailableCategories = (categories) => {
  return categories.filter(cat => cat.remaining > 0);
};

/**
 * 随机选择一个类目
 */
const selectRandomCategory = (availableCategories) => {
  const randomIndex = Math.floor(Math.random() * availableCategories.length);
  return availableCategories[randomIndex];
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  
  try {
    const { eventId, userInfo } = event;
    
    // 验证 eventId
    if (!eventId) {
      return {
        success: false,
        errorType: 'VALIDATION_ERROR',
        message: '活动ID不能为空'
      };
    }
    
    // 验证 userInfo
    console.log('接收到的 userInfo:', userInfo);
    
    // 1. 获取用户 openid
    const userId = wxContext.OPENID;
    if (!userId) {
      console.error('无法获取用户openid');
      return {
        success: false,
        errorType: 'PERMISSION_ERROR',
        message: '用户身份验证失败'
      };
    }
    
    // 2. 查询活动信息
    const eventResult = await db.collection('lottery_events')
      .doc(eventId)
      .get();
    
    if (!eventResult.data) {
      return {
        success: false,
        errorType: 'NOT_FOUND_ERROR',
        message: '活动不存在'
      };
    }
    
    const lotteryEvent = eventResult.data;
    
    // 3. 验证时间范围
    const timeValidation = validateTimeRange(lotteryEvent.startTime, lotteryEvent.endTime);
    if (!timeValidation.valid) {
      return {
        success: false,
        errorType: 'TIME_RANGE_ERROR',
        message: timeValidation.error
      };
    }
    
    // 4. 检查用户是否已参与
    const hasParticipated = await checkDuplicateParticipation(db, eventId, userId);
    if (hasParticipated) {
      return {
        success: false,
        errorType: 'DUPLICATE_ERROR',
        message: '您已参与过此次抽签'
      };
    }
    
    // 5. 获取可用类目
    const availableCategories = getAvailableCategories(lotteryEvent.categories);
    if (availableCategories.length === 0) {
      return {
        success: false,
        errorType: 'CAPACITY_ERROR',
        message: '抽签名额已满'
      };
    }
    
    // 6. 随机选择一个类目
    const selectedCategory = selectRandomCategory(availableCategories);
    
    // 7. 更新类目剩余数量（原子操作）
    // 找到选中类目的索引
    const categoryIndex = lotteryEvent.categories.findIndex(
      cat => cat.name === selectedCategory.name
    );
    
    const updateResult = await db.collection('lottery_events')
      .doc(eventId)
      .update({
        data: {
          [`categories.${categoryIndex}.remaining`]: _.inc(-1)
        }
      });
    
    if (updateResult.stats.updated === 0) {
      console.error('更新类目数量失败');
      return {
        success: false,
        errorType: 'DATABASE_ERROR',
        message: '抽签失败，请重试'
      };
    }
    
    // 8. 保存抽签结果到数据库
    const resultData = {
      eventId: eventId,
      userId: userId,
      userInfo: userInfo || {}, // 存储用户信息（头像、昵称）
      category: selectedCategory.name,
      createTime: new Date()
    };
    
    console.log('保存的 resultData:', resultData);
    
    await db.collection('lottery_results').add({
      data: resultData
    });
    
    console.log('抽签成功，用户:', userId, '抽中类目:', selectedCategory.name);
    
    // 9. 返回抽中的类目
    return {
      success: true,
      category: selectedCategory.name,
      message: '抽签成功'
    };
    
  } catch (error) {
    console.error('participateLottery error:', error);
    return {
      success: false,
      errorType: 'DATABASE_ERROR',
      message: '参与失败，请稍后重试',
      details: error.message
    };
  }
};
