// cloudfunctions/createLottery/index.js
// 创建抽签活动云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 验证标题
 */
const validateTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: '标题不能为空' };
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return { valid: false, error: '标题不能为空' };
  }
  if (trimmedTitle.length > 50) {
    return { valid: false, error: '标题长度不能超过50个字符' };
  }
  return { valid: true, error: null };
};

/**
 * 验证类目
 */
const validateCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return { valid: false, error: '类目必须是数组' };
  }
  if (categories.length === 0) {
    return { valid: false, error: '至少需要一个类目' };
  }
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    if (!category.name || typeof category.name !== 'string') {
      return { valid: false, error: `类目${i + 1}的名称不能为空` };
    }
    const trimmedName = category.name.trim();
    if (trimmedName.length === 0) {
      return { valid: false, error: `类目${i + 1}的名称不能为空` };
    }
    if (typeof category.quantity !== 'number') {
      return { valid: false, error: `类目${i + 1}的数量必须是数字` };
    }
    if (!Number.isInteger(category.quantity)) {
      return { valid: false, error: `类目${i + 1}的数量必须是整数` };
    }
    if (category.quantity <= 0) {
      return { valid: false, error: `类目${i + 1}的数量必须是正整数` };
    }
  }
  return { valid: true, error: null };
};

/**
 * 验证时间范围
 */
const validateTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime())) {
    return { valid: false, error: '开始时间格式无效' };
  }
  if (isNaN(end.getTime())) {
    return { valid: false, error: '结束时间格式无效' };
  }
  if (start >= end) {
    return { valid: false, error: '开始时间必须早于结束时间' };
  }
  
  return { valid: true, error: null };
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();  // 在函数内部获取数据库实例
  
  try {
    const { title, categories, startTime, endTime } = event;
    
    // 1. 验证输入参数
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      console.log('标题验证失败:', titleValidation.error);
      return {
        success: false,
        errorType: 'VALIDATION_ERROR',
        message: titleValidation.error
      };
    }
    
    const categoriesValidation = validateCategories(categories);
    if (!categoriesValidation.valid) {
      console.log('类目验证失败:', categoriesValidation.error);
      return {
        success: false,
        errorType: 'VALIDATION_ERROR',
        message: categoriesValidation.error
      };
    }
    
    const timeValidation = validateTimeRange(startTime, endTime);
    if (!timeValidation.valid) {
      console.log('时间验证失败:', timeValidation.error);
      return {
        success: false,
        errorType: 'TIME_RANGE_ERROR',
        message: timeValidation.error
      };
    }
    
    // 2. 获取用户 openid
    const openid = wxContext.OPENID;
    if (!openid) {
      console.error('无法获取用户openid');
      return {
        success: false,
        errorType: 'PERMISSION_ERROR',
        message: '用户身份验证失败'
      };
    }
    
    // 3. 构造活动数据对象
    const eventData = {
      title: title.trim(),
      categories: categories.map(cat => ({
        name: cat.name.trim(),
        quantity: cat.quantity,
        remaining: cat.quantity  // 初始剩余数量等于总数量
      })),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      creatorId: openid,
      createTime: new Date()
    };
    
    // 4. 插入到 lottery_events 集合
    console.log('准备插入活动数据:', JSON.stringify(eventData));
    const result = await db.collection('lottery_events').add({
      data: eventData
    });
    
    // 5. 返回活动ID
    console.log('活动创建成功，ID:', result._id);
    return {
      success: true,
      eventId: result._id,
      message: '创建成功'
    };
    
  } catch (error) {
    console.error('createLottery error:', error);
    return {
      success: false,
      errorType: 'DATABASE_ERROR',
      message: '创建失败，请稍后重试',
      details: error.message
    };
  }
};
