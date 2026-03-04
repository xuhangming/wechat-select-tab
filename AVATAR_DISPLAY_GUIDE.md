# 参与者头像显示问题排查指南

## 问题描述

抽签详情页的参与者列表中，只显示昵称，没有显示头像。

## 原因分析

代码逻辑是正确的，问题可能出在以下几个方面：

### 1. 数据库中的旧数据没有 userInfo

如果参与记录是在添加头像功能之前创建的，这些记录的 `userInfo` 字段可能为空或不包含 `avatarUrl`。

### 2. 用户未授权头像和昵称

在参与抽签时，如果用户没有授权获取头像和昵称，`userInfo` 会是空对象。

### 3. 云存储路径问题

临时文件路径（`wxfile://`）需要上传到云存储才能在其他用户的设备上显示。

## 排查步骤

### 步骤 1: 查看控制台日志

1. 打开微信开发者工具
2. 进入抽签详情页
3. 查看控制台输出，会看到类似这样的日志：

```
参与者数据: {userId: "xxx", category: "xxx", userInfo: {...}, createTime: ...}
userInfo: {avatarUrl: "xxx", nickName: "xxx"}
avatarUrl: "xxx"
```

检查：
- `userInfo` 是否存在
- `avatarUrl` 是否有值
- `avatarUrl` 的格式（是否是有效的 URL）

### 步骤 2: 检查数据库记录

在微信开发者工具的云开发控制台中：

1. 打开 `lottery_results` 集合
2. 查看参与记录
3. 检查每条记录是否有 `userInfo` 字段
4. 检查 `userInfo.avatarUrl` 是否有值

示例正确的数据结构：
```json
{
  "_id": "xxx",
  "eventId": "xxx",
  "userId": "xxx",
  "category": "任务A",
  "userInfo": {
    "avatarUrl": "cloud://xxx.png",
    "nickName": "用户昵称"
  },
  "createTime": "2024-01-01T00:00:00.000Z"
}
```

### 步骤 3: 测试新参与

1. 创建一个新的抽签活动
2. 确保已授权头像和昵称（在首页点击授权按钮）
3. 参与抽签
4. 刷新详情页，查看是否显示头像

## 解决方案

### 方案 1: 清理旧数据，重新参与

如果是测试环境，可以：
1. 删除 `lottery_results` 集合中的旧记录
2. 重新参与抽签
3. 新的参与记录会包含完整的 userInfo

### 方案 2: 迁移旧数据（生产环境）

如果已有大量用户数据，需要编写数据迁移脚本：

```javascript
// 在云函数中执行
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  // 查询所有没有 userInfo 的记录
  const results = await db.collection('lottery_results')
    .where({
      userInfo: db.command.exists(false)
    })
    .get();
  
  // 为每条记录添加默认的 userInfo
  const promises = results.data.map(result => {
    return db.collection('lottery_results')
      .doc(result._id)
      .update({
        data: {
          userInfo: {
            avatarUrl: '',
            nickName: '匿名用户'
          }
        }
      });
  });
  
  await Promise.all(promises);
  
  return {
    success: true,
    updated: results.data.length
  };
};
```

### 方案 3: 前端容错处理（已实现）

代码中已经实现了容错处理：

1. 如果 `userInfo.avatarUrl` 存在，显示真实头像
2. 如果不存在，显示带首字母的占位头像（紫粉渐变背景）
3. 昵称默认显示"匿名用户"

## 代码说明

### 参与抽签时保存 userInfo

在 `pages/detail/detail.js` 的 `participateLottery` 方法中：

```javascript
// 检查用户是否已授权登录
const userInfo = wx.getStorageSync('userInfo');
if (!userInfo || !userInfo.avatarUrl || !userInfo.nickName) {
  // 提示用户去授权
  wx.showModal({
    title: '需要授权',
    content: '参与抽签需要获取您的头像和昵称，请先完成授权',
    // ...
  });
  return;
}

// 上传头像到云存储（如果是临时路径）
let cloudAvatarUrl = userInfo.avatarUrl;
if (userInfo.avatarUrl && userInfo.avatarUrl.startsWith('wxfile://')) {
  const uploadRes = await wx.cloud.uploadFile({
    cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
    filePath: userInfo.avatarUrl
  });
  cloudAvatarUrl = uploadRes.fileID;
}

// 调用云函数，传递 userInfo
const res = await participateLottery(this.data.eventId, {
  avatarUrl: cloudAvatarUrl,
  nickName: userInfo.nickName
});
```

### 云函数保存 userInfo

在 `cloudfunctions/participateLottery/index.js` 中：

```javascript
const resultData = {
  eventId: eventId,
  userId: userId,
  userInfo: userInfo || {}, // 存储用户信息（头像、昵称）
  category: selectedCategory.name,
  createTime: new Date()
};

await db.collection('lottery_results').add({
  data: resultData
});
```

### 详情页显示头像

在 `pages/detail/detail.wxml` 中：

```xml
<!-- 如果有头像 URL，显示真实头像 -->
<image wx:if="{{item.userInfo.avatarUrl}}" 
       class="participant-avatar" 
       src="{{item.userInfo.avatarUrl}}" 
       mode="aspectFill"></image>

<!-- 否则显示占位头像 -->
<view wx:else class="participant-avatar avatar-placeholder">
  <text class="avatar-initial">{{item.userInfo.nickName ? item.userInfo.nickName.substring(0, 1) : '匿'}}</text>
</view>
```

## 验证清单

- [ ] 用户已在首页完成授权（头像和昵称）
- [ ] 参与抽签时控制台没有错误
- [ ] 数据库中的 `lottery_results` 记录包含 `userInfo` 字段
- [ ] `userInfo.avatarUrl` 是有效的云存储路径或 HTTP URL
- [ ] 详情页控制台输出显示正确的 userInfo 数据
- [ ] 头像图片能正常加载（检查网络请求）

## 常见问题

### Q: 为什么有些用户显示头像，有些不显示？

A: 可能是因为：
1. 旧用户的数据没有 userInfo（在添加头像功能之前参与的）
2. 部分用户参与时没有授权
3. 头像上传失败

### Q: 头像显示为占位图，但数据库中有 avatarUrl

A: 可能是：
1. avatarUrl 是临时路径，已过期
2. 云存储权限设置问题
3. 图片加载失败（网络问题）

可以在 `detail.js` 中添加图片加载错误处理：

```javascript
onAvatarError(e) {
  console.error('头像加载失败:', e);
  // 可以在这里设置一个标记，强制显示占位图
}
```

### Q: 如何确保所有新用户都有头像？

A: 代码中已经实现了强制授权逻辑：
1. 参与抽签前检查 userInfo
2. 如果没有授权，弹窗提示用户去授权
3. 授权后才能参与抽签

## 下一步

1. 在微信开发者工具中打开详情页
2. 查看控制台日志，确认 userInfo 数据
3. 根据日志输出判断问题所在
4. 如果是旧数据问题，可以清理测试数据重新测试
5. 如果是授权问题，确保用户在首页完成授权

如果问题仍然存在，请提供控制台日志截图，我可以帮你进一步排查。
