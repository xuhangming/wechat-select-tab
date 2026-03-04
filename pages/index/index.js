// pages/index/index.js
const { formatTime } = require('../../utils/util');
const uiFeedback = require('../../utils/uiFeedback');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    avatarUrl: '',
    nickName: '',
    loading: false,
    returnTo: '', // 授权后返回的页面
    eventId: '' // 返回详情页时需要的活动ID
  },

  onLoad(options) {
    // 保存返回信息
    if (options.returnTo) {
      this.setData({
        returnTo: options.returnTo,
        eventId: options.eventId || ''
      });
    }

    // 检查是否已有用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    // 验证 userInfo 是否完整
    const isValidUserInfo = userInfo && userInfo.avatarUrl && userInfo.nickName;
    
    if (isValidUserInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
      
      // 如果已登录且有返回地址，直接跳转
      if (this.data.returnTo === 'detail' && this.data.eventId) {
        wx.redirectTo({
          url: `/pages/detail/detail?id=${this.data.eventId}`
        });
        return;
      }
    } else {
      // 未登录或信息不完整，清除旧数据
      if (userInfo) {
        wx.removeStorageSync('userInfo');
      }
    }
  },

  onShow() {
    // 页面显示时不需要刷新数据
  },

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl
    });
  },

  /**
   * 输入昵称
   */
  onNicknameInput(e) {
    const nickName = e.detail.value;
    this.setData({
      nickName
    });
  },

  /**
   * 完成授权登录
   */
  async completeLogin() {
    const { avatarUrl, nickName } = this.data;
    
    // 验证是否已选择头像和输入昵称
    if (!avatarUrl) {
      uiFeedback.showToast('请选择头像');
      return;
    }
    
    if (!nickName || nickName.trim() === '') {
      uiFeedback.showToast('请输入昵称');
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    try {
      let cloudAvatarUrl = avatarUrl;
      
      // 如果是临时文件路径，上传到云存储
      if (avatarUrl.startsWith('wxfile://')) {
        console.log('上传头像到云存储...');
        try {
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
            filePath: avatarUrl
          });
          
          if (uploadRes.fileID) {
            cloudAvatarUrl = uploadRes.fileID;
            console.log('头像上传成功:', cloudAvatarUrl);
          }
        } catch (uploadError) {
          console.error('头像上传失败:', uploadError);
          // 上传失败时继续使用临时路径，后续参与抽签时会再次尝试上传
        }
      }

      // 构造用户信息（使用云存储路径）
      const userInfo = {
        avatarUrl: cloudAvatarUrl,
        nickName: nickName.trim()
      };

      // 保存用户信息
      this.setData({
        userInfo,
        hasUserInfo: true,
        avatarUrl: cloudAvatarUrl
      });
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo);
      
      wx.hideLoading();
      
      // 显示成功提示
      uiFeedback.showSuccess('登录成功');
      
      // 如果有返回地址，跳转回去
      if (this.data.returnTo === 'detail' && this.data.eventId) {
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/detail/detail?id=${this.data.eventId}`
          });
        }, 500); // 延迟500ms让用户看到成功提示
        return;
      }
      
      // 否则不需要加载数据
    } catch (error) {
      console.error('登录失败:', error);
      wx.hideLoading();
      uiFeedback.showError('登录失败，请重试');
    }
  },

  /**
   * 导航到我参与的抽签列表
   */
  navigateToParticipated() {
    wx.navigateTo({
      url: '/pages/history/history?type=participated'
    });
  },

  /**
   * 导航到我创建的抽签列表
   */
  navigateToCreated() {
    wx.navigateTo({
      url: '/pages/history/history?type=created'
    });
  },

  /**
   * 跳转到创建页面
   */
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  /**
   * 跳转到历史记录
   */
  navigateToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后需要重新授权才能使用',
      confirmText: '确认退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo');
          
          // 重置页面数据
          this.setData({
            userInfo: null,
            hasUserInfo: false,
            avatarUrl: '',
            nickName: '',
            loading: false
          });
          
          // 显示提示
          uiFeedback.showSuccess('已退出登录');
        }
      }
    });
  }
});
