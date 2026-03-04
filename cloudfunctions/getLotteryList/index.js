// cloudfunctions/getLotteryList/index.js
// 获取抽签列表云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  
  try {
    // 1. 获取用户 openid
    const openid = wxContext.OPENID;
    if (!openid) {
      console.error('无法获取用户openid');
      return {
        success: false,
        errorType: 'PERMISSION_ERROR',
        message: '用户身份验证失败'
      };
    }
    
    // 2. 查询该用户创建的所有活动，按创建时间倒序排序
    console.log('查询用户活动列表，openid:', openid);
    const result = await db.collection('lottery_events')
      .where({
        creatorId: openid
      })
      .orderBy('createTime', 'desc')
      .get();
    
    // 3. 返回活动基本信息
    const list = result.data.map(event => {
      const now = new Date();
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      
      // 确保 categories 存在，如果不存在则使用空数组
      const categories = event.categories || [];
      
      console.log('处理活动:', event.title, 'categories:', categories);
      
      // 计算活动状态
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
        createTime: event.createTime,
        categories: categories,
        status: status
      };
      
      console.log('返回数据:', JSON.stringify(returnData));
      
      return returnData;
    });
    
    console.log(`查询成功，找到 ${list.length} 个活动`);
    return {
      success: true,
      list: list
    };
    
  } catch (error) {
    console.error('getLotteryList error:', error);
    return {
      success: false,
      errorType: 'DATABASE_ERROR',
      message: '查询失败，请稍后重试',
      details: error.message
    };
  }
};
