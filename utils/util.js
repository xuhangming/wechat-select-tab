// utils/util.js
// 工具函数

const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

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

const validateTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  if (isNaN(start.getTime())) {
    return { valid: false, error: '开始时间格式无效' };
  }
  if (isNaN(end.getTime())) {
    return { valid: false, error: '结束时间格式无效' };
  }
  if (start >= end) {
    return { valid: false, error: '开始时间必须早于结束时间' };
  }
  if (start < now) {
    return { valid: false, error: '开始时间不能早于当前时间' };
  }
  return { valid: true, error: null };
};

const validateLotteryData = (data) => {
  const errors = {};
  const titleResult = validateTitle(data.title);
  if (!titleResult.valid) {
    errors.title = titleResult.error;
  }
  const categoriesResult = validateCategories(data.categories);
  if (!categoriesResult.valid) {
    errors.categories = categoriesResult.error;
  }
  const timeResult = validateTimeRange(data.startTime, data.endTime);
  if (!timeResult.valid) {
    errors.time = timeResult.error;
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : null
  };
};

module.exports = {
  formatTime,
  validateTitle,
  validateCategories,
  validateTimeRange,
  validateLotteryData
};
