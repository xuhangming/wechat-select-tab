// pages/detail/detail.js
const { getLotteryDetail, participateLottery } = require('../../utils/api');
const uiFeedback = require('../../utils/uiFeedback');
const utilModule = require('../../utils/util');

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
    eventId: '',
    event: null,
    results: [],
    loading: true,
    participating: false,
    status: '', // 'not_started' | 'ongoing' | 'ended'
    statusText: '',
    isCreator: false,
    hasParticipated: false,
    totalCount: 0,
    assignedCount: 0,
    // 默认头像 - 简单的用户图标
    defaultAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNhODU1Zjc7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWM0ODk5O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNIDI1IDc1IFEgMjUgNTUgNTAgNTUgUSA3NSA1NSA3NSA3NSBMIDc1IDEwMCBMIDI1IDEwMCBaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+PC9zdmc+'
  },

  onLoad(options) {
    console.log('Detail page onLoad, options:', options);
    const eventId = options.id;
    if (!eventId) {
      console.error('活动ID不存在');
      uiFeedback.showError('活动ID不存在', 1500, () => {
        wx.navigateBack();
      });
      return;
    }

    console.log('设置eventId:', eventId);
    this.setData({ eventId });
    this.loadLotteryDetail();
  },

  /**
   * 加载抽签详情
   */
  async loadLotteryDetail() {
    console.log('开始加载抽签详情, eventId:', this.data.eventId);
    this.setData({ loading: true });

    try {
      const res = await getLotteryDetail(this.data.eventId);
      console.log('getLotteryDetail 返回结果:', res);

      if (res.success) {
        const { event, results, isCreator, hasParticipated } = res;
        console.log('活动数据:', event);
        console.log('参与结果:', results);
        
        // 计算活动状态（使用统一的工具函数）
        const status = getEventStatus(event);
        console.log('活动状态:', status);
        
        // 格式化时间
        event.startTimeDisplay = this._formatTime(event.startTime);
        event.endTimeDisplay = this._formatTime(event.endTime);
        
        // 计算已抽数量和总数量
        const totalCount = event.categories.reduce((sum, cat) => sum + cat.quantity, 0);
        const assignedCount = event.categories.reduce((sum, cat) => sum + (cat.quantity - cat.remaining), 0);
        
        // 格式化参与结果，添加显示时间
        const formattedResults = results.map(result => {
          console.log('参与者数据:', result);
          console.log('userInfo:', result.userInfo);
          console.log('avatarUrl:', result.userInfo?.avatarUrl);
          return {
            ...result,
            createTimeDisplay: this._formatTime(result.createTime),
            userInfo: result.userInfo || {}
          };
        });

        // 计算状态文本
        const statusText = this.getStatusText(status);

        console.log('准备设置数据到页面');
        this.setData({
          event,
          results: formattedResults,
          status,
          statusText,
          totalCount,
          assignedCount,
          hasParticipated: hasParticipated || false,
          isCreator: isCreator || false,
          loading: false
        });
      } else {
        console.error('加载失败:', res.message);
        uiFeedback.showError(res.message || '加载失败');
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('加载抽签详情失败:', error);
      uiFeedback.showError('加载失败，请重试');
      this.setData({ loading: false });
    }
  },

  /**
   * 参与抽签
   */
  async participateLottery() {
    // 检查活动状态
    if (this.data.status === 'not_started') {
      uiFeedback.showToast('活动尚未开始');
      return;
    }

    if (this.data.status === 'ended') {
      uiFeedback.showToast('活动已结束');
      return;
    }

    // 检查是否已参与
    if (this.data.hasParticipated) {
      uiFeedback.showToast('您已参与过此次抽签');
      return;
    }

    // 检查是否还有剩余名额
    const hasRemaining = this.data.event.categories.some(cat => cat.remaining > 0);
    if (!hasRemaining) {
      uiFeedback.showToast('抽签名额已满');
      return;
    }

    // 检查用户是否已授权登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.avatarUrl || !userInfo.nickName) {
      // 未授权，跳转到首页进行授权
      wx.showModal({
        title: '需要授权',
        content: '参与抽签需要获取您的头像和昵称，请先完成授权',
        confirmText: '去授权',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 使用 redirectTo 跳转到首页，并传递当前活动ID
            wx.redirectTo({
              url: `/pages/index/index?returnTo=detail&eventId=${this.data.eventId}`
            });
          }
        }
      });
      return;
    }

    this.setData({ participating: true });

    try {
      // 上传头像到云存储
      let cloudAvatarUrl = userInfo.avatarUrl;
      
      // 如果是临时文件路径，需要上传到云存储
      if (userInfo.avatarUrl && userInfo.avatarUrl.startsWith('wxfile://')) {
        console.log('检测到临时文件路径，开始上传到云存储...', userInfo.avatarUrl);
        
        // 显示上传提示
        wx.showLoading({
          title: '上传头像中...',
          mask: true
        });
        
        try {
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
            filePath: userInfo.avatarUrl
          });
          
          wx.hideLoading();
          
          console.log('上传结果:', uploadRes);
          
          if (uploadRes.fileID) {
            cloudAvatarUrl = uploadRes.fileID;
            console.log('头像上传成功，云存储路径:', cloudAvatarUrl);
            
            // 更新本地存储的 userInfo
            const updatedUserInfo = {
              ...userInfo,
              avatarUrl: cloudAvatarUrl
            };
            wx.setStorageSync('userInfo', updatedUserInfo);
          } else {
            console.error('上传返回结果中没有 fileID');
          }
        } catch (uploadError) {
          wx.hideLoading();
          console.error('头像上传失败:', uploadError);
          console.error('错误详情:', JSON.stringify(uploadError));
          
          // 上传失败时，不使用临时路径，而是不传头像
          cloudAvatarUrl = '';
          uiFeedback.showToast('头像上传失败，将使用默认头像');
        }
      }
      
      console.log('最终使用的头像路径:', cloudAvatarUrl);
      
      // 使用云存储路径的 userInfo
      const userInfoForCloud = {
        avatarUrl: cloudAvatarUrl,
        nickName: userInfo.nickName
      };

      const res = await participateLottery(this.data.eventId, userInfoForCloud);

      if (res.success) {
        uiFeedback.showSuccess(`抽中：${res.category}`, 2000, () => {
          this.loadLotteryDetail();
        });
      } else {
        uiFeedback.showError(res.message || '参与失败');
      }
    } catch (error) {
      console.error('参与抽签失败:', error);
      uiFeedback.showError('参与失败，请重试');
    } finally {
      this.setData({ participating: false });
    }
  },

  /**
   * 刷新结果
   */
  async refreshResults() {
    this.loadLotteryDetail();
  },

  /**
   * 头像加载失败处理
   */
  onAvatarError(e) {
    console.error('头像加载失败:', e);
    const index = e.currentTarget.dataset.index;
    if (index !== undefined) {
      // 如果头像加载失败，使用默认头像
      const results = this.data.results;
      results[index].userInfo.avatarUrl = this.data.defaultAvatar;
      this.setData({ results });
    }
  },

  /**
   * 格式化时间（用于数据处理）
   */
  _formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const statusMap = {
      'not_started': '未开始',
      'ongoing': '进行中',
      'ended': '已结束'
    };
    return statusMap[status] || '';
  },

  /**
   * 分享配置
   */
  onShareAppMessage() {
    const { event, eventId } = this.data;
    
    return {
      title: `邀请你参与抽签：${event ? event.title : '抽签活动'}`,
      path: `/pages/detail/detail?id=${eventId}`,
      imageUrl: ''
    };
  },

  /**
   * 分享到朋友圈配置
   */
  onShareTimeline() {
    const { event, eventId } = this.data;
    
    return {
      title: `邀请你参与抽签：${event ? event.title : '抽签活动'}`,
      query: `id=${eventId}`,
      imageUrl: ''
    };
  }
});
