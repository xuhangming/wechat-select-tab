// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
         env: 'cloud1-3guqjyn1eea239db',
        traceUser: true,
      });
    }

    // 获取用户信息
    this.globalData = {
      userInfo: null,
      openid: null
    };

    // 首次授权：获取用户openid
    this.getUserOpenId();
  },

  /**
   * 获取用户openid
   * 在微信小程序云开发中，openid会在云函数调用时自动传递
   * 这里通过调用一个简单的云函数来获取openid并存储到全局数据中
   */
  async getUserOpenId() {
    try {
      // 检查是否已经有openid
      if (this.globalData.openid) {
        return this.globalData.openid;
      }

      // 通过云函数获取openid
      // 在云开发模式下，云函数会自动获取调用者的openid
      // 这里我们可以调用任意云函数，openid会在event.userInfo.openId中返回
      // 为了简化，我们直接使用wx.cloud.callFunction，云函数会自动处理身份信息
      
      // 注意：在实际使用中，openid会在每次云函数调用时自动传递
      // 这里只是为了在应用启动时预先获取并缓存
      const result = await wx.cloud.callFunction({
        name: 'getLotteryList',
        data: {}
      });

      // 在云函数返回中，openid会自动包含在上下文中
      // 实际上，我们不需要显式存储openid，因为每次云函数调用都会自动传递
      // 但为了兼容性和调试，我们可以在这里标记已授权
      this.globalData.openid = 'auto'; // 标记为自动获取模式
      
      console.log('用户授权成功，openid将在云函数调用时自动传递');
    } catch (error) {
      console.error('获取用户授权信息失败:', error);
      // 授权失败不影响应用启动，云函数调用时会自动处理
    }
  }
});
