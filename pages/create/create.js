// pages/create/create.js
const { validateLotteryData } = require('../../utils/util');
const { createLottery } = require('../../utils/api');
const uiFeedback = require('../../utils/uiFeedback');

Page({
  data: {
    // 基本信息
    title: '',
    description: '',
    
    // 抽签选项（最多1000项）
    options: [
      { name: '', quantity: 1 }
    ],
    
    // 时间设置（按天）
    startDate: '',
    endDate: '',
    durationDays: 1,
    
    // 高级设置
    password: '',
    resultViewPermission: 'all', // 'all' | 'creator' | 'participants'
    
    errors: {},
    loading: false
  },

  onLoad() {
    this.initDefaultTime();
  },

  /**
   * 初始化默认时间
   */
  initDefaultTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const startDate = `${year}-${month}-${day}`;
    
    // 默认结束时间为1天后
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endYear = tomorrow.getFullYear();
    const endMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const endDay = String(tomorrow.getDate()).padStart(2, '0');
    const endDate = `${endYear}-${endMonth}-${endDay}`;
    
    this.setData({
      startDate,
      endDate,
      durationDays: 1
    });
  },

  /**
   * 标题输入
   */
  onTitleInput(e) {
    this.setData({
      title: e.detail.value,
      'errors.title': ''
    });
  },

  /**
   * 描述输入
   */
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value,
      'errors.description': ''
    });
  },

  /**
   * 选项名称输入
   */
  onOptionNameInput(e) {
    const index = e.currentTarget.dataset.index;
    const options = this.data.options;
    options[index].name = e.detail.value;
    this.setData({
      options,
      'errors.options': ''
    });
  },

  /**
   * 选项数量输入
   */
  onOptionQuantityInput(e) {
    const index = e.currentTarget.dataset.index;
    const options = this.data.options;
    const value = e.detail.value;
    
    // 允许用户清空输入框，但在提交时会验证
    if (value === '' || value === null || value === undefined) {
      options[index].quantity = '';
    } else {
      const numValue = parseInt(value);
      options[index].quantity = numValue > 0 ? numValue : '';
    }
    
    this.setData({
      options,
      'errors.options': ''
    });
  },

  /**
   * 添加选项
   */
  addOption() {
    const options = this.data.options;
    
    // 最多1000项
    if (options.length >= 1000) {
      uiFeedback.showToast('最多添加1000个选项');
      return;
    }
    
    options.push({ name: '', quantity: 1 });
    this.setData({
      options
    });
  },

  /**
   * 删除选项
   */
  removeOption(e) {
    const index = e.currentTarget.dataset.index;
    const options = this.data.options;
    
    // 至少保留一个选项
    if (options.length <= 1) {
      uiFeedback.showToast('至少需要一个选项');
      return;
    }

    options.splice(index, 1);
    this.setData({
      options
    });
  },

  /**
   * 开始日期选择
   */
  onStartDateChange(e) {
    const startDate = e.detail.value;
    this.setData({
      startDate,
      'errors.time': ''
    });
    this.calculateDuration();
  },

  /**
   * 结束日期选择
   */
  onEndDateChange(e) {
    const endDate = e.detail.value;
    this.setData({
      endDate,
      'errors.time': ''
    });
    this.calculateDuration();
  },

  /**
   * 计算持续天数
   */
  calculateDuration() {
    const { startDate, endDate } = this.data;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.setData({
        durationDays: diffDays > 0 ? diffDays : 0
      });
    }
  },

  /**
   * 口令输入
   */
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      'errors.password': ''
    });
  },

  /**
   * 结果查看权限选择
   */
  onPermissionChange(e) {
    this.setData({
      resultViewPermission: e.detail.value
    });
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { title, options, startDate, endDate } = this.data;
    const errors = {};

    // 验证标题
    if (!title || title.trim() === '') {
      errors.title = '请输入抽签标题';
    } else if (title.length > 50) {
      errors.title = '标题长度不能超过50个字符';
    }

    // 验证选项
    const validOptions = options.filter(opt => opt.name && opt.name.trim() !== '');
    if (validOptions.length === 0) {
      errors.options = '至少需要一个选项';
    }

    // 验证时间
    if (!startDate) {
      errors.time = '请选择开始日期';
    } else if (!endDate) {
      errors.time = '请选择结束日期';
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        errors.time = '结束日期必须晚于开始日期';
      }
    }

    if (Object.keys(errors).length > 0) {
      this.setData({ errors });
      const firstError = Object.values(errors)[0];
      uiFeedback.showError(firstError);
      return false;
    }

    return true;
  },

  /**
   * 提交创建抽签
   */
  async submitLottery() {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }

    // 显示加载状态
    this.setData({ loading: true });

    try {
      const { title, description, options, startDate, endDate, password, resultViewPermission } = this.data;

      // 过滤并格式化选项数据
      const validOptions = options
        .filter(opt => opt.name && opt.name.trim() !== '')
        .map(opt => ({
          name: opt.name.trim(),
          quantity: (opt.quantity && opt.quantity > 0) ? opt.quantity : 1
        }));

      // 构造开始和结束时间（设置为当天的开始和结束）
      const startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0);
      
      const endTime = new Date(endDate);
      endTime.setHours(23, 59, 59, 999);

      // 调用云函数创建抽签
      const res = await createLottery({
        title: title.trim(),
        description: description.trim(),
        categories: validOptions, // 保持兼容性，使用 categories 字段
        startTime,
        endTime,
        password: password.trim(),
        resultViewPermission
      });

      if (res.success) {
        uiFeedback.showSuccess('创建成功', 2000, () => {
          wx.redirectTo({
            url: `/pages/detail/detail?id=${res.eventId}`
          });
        });
      } else {
        // 处理失败情况
        uiFeedback.showError(res.message || '创建失败');
      }
    } catch (error) {
      console.error('创建抽签失败:', error);
      uiFeedback.showError('创建失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  }
});
