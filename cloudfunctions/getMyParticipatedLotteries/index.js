// cloudfunctions/getMyParticipatedLotteries/index.js
// 获取用户参与的抽签列表云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  
  try {
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
    
    // 2. 查询用户参与的所有抽签结果
    console.log('查询用户参与的抽签，userId:', userId);
    const resultsData = await db.collection('lottery_results')
      .where({
        userId: userId
      })
      .orderBy('createTime', 'desc')
      .get();
    
    if (resultsData.data.length === 0) {
      console.log('用户未参与任何抽签');
      return {
        success: true,
        list: []
      };
    }
    
    // 3. 获取所有相关的活动ID
    const eventIds = [...new Set(resultsData.data.map(r => r.eventId))];
    
    // 4. 批量查询活动信息
    const eventsData = await db.collection('lottery_events')
      .where({
        _id: db.command.in(eventIds)
      })
      .get();
    
    // 5. 构建活动映射
    const eventsMap = {};
    eventsData.data.forEach(event => {
      eventsMap[event._id] = event;
    });
    
    // 6. 组合数据
    const list = resultsData.data
      .filter(result => eventsMap[result.eventId]) // 过滤掉已删除的活动
      .map(result => {
        const event = eventsMap[result.eventId];
        const now = new Date();
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        
        // 确保 categories 存在
        const categories = event.categories || [];
        
        console.log('处理参与的活动:', event.title, 'categories:', categories);
        
        // 计算活动状态（与 getLotteryList 保持一致）
        let status = 'ended';
        if (now < startTime) {
          status = 'pending';
        } else if (now >= startTime && now <= endTime) {
          // 检查是否所有类目都已抽完
          const allCategoriesFull = categories.length > 0 && categories.every(cat => cat.remaining === 0);
          if (allCategoriesFull) {
            status = 'ended';
          } else {
            status = 'ongoing';
          }
        }
        
        const returnData = {
          _id: event._id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          createTime: result.createTime,
          myCategory: result.category,
          categories: categories,
          status: status
        };
        
        console.log('返回参与数据:', JSON.stringify(returnData));
        
        return returnData;
      });
    
    console.log(`查询成功，找到 ${list.length} 个参与的抽签`);
    return {
      success: true,
      list: list
    };
    
  } catch (error) {
    console.error('getMyParticipatedLotteries error:', error);
    return {
      success: false,
      errorType: 'DATABASE_ERROR',
      message: '查询失败，请稍后重试',
      details: error.message
    };
  }
};
