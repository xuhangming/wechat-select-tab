// pages/history/history.js
const { getLotteryList, getMyParticipatedLotteries } = require('../../utils/api');
const utilModule = require('../../utils/util');
const { formatTime } = utilModule;
const uiFeedback = require('../../utils/uiFeedback');

// 从 util 模块获取 getEventStatus，如果不存在则使用本地定义
const getEventStatus = utilModule.getEventStatus || function(event) {
  if (!event) return 'ended';
  
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  if (now < startTime) {
    return 'not_started';
  }
  
  if (now > endTime) {
    return 'ended';
  }
  
  if (event.categories && event.categories.length > 0) {
    const allCategoriesFull = event.categories.every(cat => cat.remaining === 0);
    if (allCategoriesFull) {
      return 'ended';
    }
  }
  
  return 'ongoing';
};

Page({
  data: {
    lotteryList: [],
    loading: true,
    type: 'all' // 'all' | 'created' | 'participated'
  },

  onLoad(options) {
    // 获取页面类型参数
    const type = options.type || 'all';
    this.setData({ type });
    
    // 设置导航栏标题
    if (type === 'created') {
      wx.setNavigationBarTitle({
        title: '我创建的抽签'
      });
    } else if (type === 'participated') {
      wx.setNavigationBarTitle({
        title: '我参与的抽签'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '历史记录'
      });
    }
    
    this.loadLotteryList();
  },

  /**
   * 页面显示时刷新列表
   */
  onShow() {
    // 如果不是首次加载，刷新列表
    if (!this.data.loading) {
      this.loadLotteryList();
    }
  },

  /**
   * 加载抽签列表
   */
  async loadLotteryList() {
    this.setData({ loading: true });

    try {
      let res;
      
      // 根据类型加载不同的数据
      if (this.data.type === 'participated') {
        res = await getMyParticipatedLotteries();
      } else {
        res = await getLotteryList();
      }

      if (res.success) {
        const list = res.list || [];
        
        console.log('云函数返回的原始数据:', JSON.stringify(list[0]));
        
        // 处理列表数据，添加显示字段
        const processedList = list.map(item => {
          // 使用统一的状态计算函数
          const status = getEventStatus(item);
          
          // 计算统计信息
          let totalCount = 0;
          let assignedCount = 0;
          
          console.log('处理活动:', item.title);
          console.log('categories:', item.categories);
          
          if (item.categories && item.categories.length > 0) {
            totalCount = item.categories.reduce((sum, cat) => sum + cat.quantity, 0);
            assignedCount = item.categories.reduce((sum, cat) => sum + (cat.quantity - cat.remaining), 0);
            console.log('totalCount:', totalCount, 'assignedCount:', assignedCount);
          } else {
            console.log('没有 categories 数据');
          }

          return {
            ...item,
            status,
            totalCount,
            assignedCount,
            createTimeDisplay: formatTime(new Date(item.createTime)),
            startTimeDisplay: formatTime(new Date(item.startTime)),
            endTimeDisplay: formatTime(new Date(item.endTime))
          };
        });

        this.setData({
          lotteryList: processedList,
          loading: false
        });
      } else {
        uiFeedback.showError(res.message || '加载失败');
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('加载抽签列表失败:', error);
      uiFeedback.showError('加载失败，请重试');
      this.setData({ loading: false });
    }
  },

  /**
   * 跳转到详情页
   */
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  /**
   * 跳转到创建页面
   */
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  }
});
