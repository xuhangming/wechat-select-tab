// cloudfunctions/getLotteryDetail/index.js
// 获取抽签详情云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 验证用户权限
 * 检查用户是否是活动创建者或参与者
 */
const checkUserPermission = async (db, eventId, userId, creatorId) => {
  // 如果是创建者，直接返回 true
  if (userId === creatorId) {
    return true;
  }
  
  // 检查是否是参与者
  const result = await db.collection('lottery_results')
    .where({
      eventId: eventId,
      userId: userId
    })
    .count();
  
  return result.total > 0;
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  
  try {
    const { eventId } = event;
    
    // 验证 eventId
    if (!eventId) {
      return {
        success: false,
        errorType: 'VALIDATION_ERROR',
        message: '活动ID不能为空'
      };
    }
    
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
    console.log('查询活动详情，eventId:', eventId);
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
    
    // 3. 查询该活动的所有抽签结果
    const resultsData = await db.collection('lottery_results')
      .where({
        eventId: eventId
      })
      .orderBy('createTime', 'asc')
      .get();
    
    // 4. 返回活动详情和结果列表
    const isCreator = lotteryEvent.creatorId === userId;
    const hasParticipated = resultsData.data.some(result => result.userId === userId);
    
    const response = {
      success: true,
      event: {
        _id: lotteryEvent._id,
        title: lotteryEvent.title,
        description: lotteryEvent.description,
        categories: lotteryEvent.categories,
        startTime: lotteryEvent.startTime,
        endTime: lotteryEvent.endTime,
        creatorId: lotteryEvent.creatorId
      },
      results: resultsData.data.map(result => ({
        userId: result.userId,
        category: result.category,
        userInfo: result.userInfo || {},
        createTime: result.createTime
      })),
      isCreator: isCreator,
      hasParticipated: hasParticipated
    };
    
    console.log(`查询成功，找到 ${response.results.length} 条抽签结果`);
    return response;
    
  } catch (error) {
    console.error('getLotteryDetail error:', error);
    return {
      success: false,
      errorType: 'DATABASE_ERROR',
      message: '查询失败，请稍后重试',
      details: error.message
    };
  }
};
