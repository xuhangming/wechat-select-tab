# 头像显示问题 - 快速修复指南

## 问题诊断

根据控制台日志，问题已确认：

```
avatarUrl: wxfile://tmp_9c899555243eff45eccd34cfcbc14fd2.jpg
avatarUrl: wxfile://tmp_f1b1d483b675488d50ab51294bfce43045713696a6c14775.jpg
avatarUrl: wxfile://tmp_54819fbee26e4cbf2989f081dfc482e17efa1e7ebdb6416e.jpg
```

所有头像都是 `wxfile://` 临时路径，这些路径：
- ❌ 只在当前设备有效
- ❌ 刷新后失效
- ❌ 其他用户无法访问

## 解决方案

已修改代码，将头像上传到云存储。

## 立即修复步骤

### 步骤 1: 配置云存储权限（必须）

1. 打开微信开发者工具
2. 点击"云开发"按钮
3. 进入"存储"标签
4. 点击"权限设置"
5. 添加权限规则：

```json
{
  "read": true,
  "write": "auth != null"
}
```

6. 点击"保存"

### 步骤 2: 清除旧数据（推荐）

在云开发控制台：

1. 进入"数据库"标签
2. 选择 `lottery_results` 集合
3. 删除所有测试记录（或只删除有问题的记录）

### 步骤 3: 重新测试

1. 在小程序中进入抽签详情页
2. 点击"参与抽签"
3. 观察控制台输出，应该看到：

```
检测到临时文件路径，开始上传到云存储... wxfile://tmp_xxx.jpg
上传结果: {fileID: "cloud://xxx.jpg", statusCode: 200}
头像上传成功，云存储路径: cloud://xxx.jpg
最终使用的头像路径: cloud://xxx.jpg
```

4. 刷新页面，头像应该正常显示

## 代码改进

已对 `pages/detail/detail.js` 进行以下改进：

### 1. 强制上传到云存储

```javascript
// 如果是临时文件路径，必须上传到云存储
if (userInfo.avatarUrl && userInfo.avatarUrl.startsWith('wxfile://')) {
  const uploadRes = await wx.cloud.uploadFile({
    cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
    filePath: userInfo.avatarUrl
  });
  cloudAvatarUrl = uploadRes.fileID;
}
```

### 2. 添加上传提示

```javascript
wx.showLoading({
  title: '上传头像中...',
  mask: true
});
```

### 3. 详细日志

```javascript
console.log('检测到临时文件路径，开始上传到云存储...', userInfo.avatarUrl);
console.log('上传结果:', uploadRes);
console.log('头像上传成功，云存储路径:', cloudAvatarUrl);
console.log('最终使用的头像路径:', cloudAvatarUrl);
```

### 4. 错误处理

```javascript
catch (uploadError) {
  console.error('头像上传失败:', uploadError);
  cloudAvatarUrl = ''; // 使用空字符串，显示占位头像
  uiFeedback.showToast('头像上传失败，将使用默认头像');
}
```

### 5. 更新本地缓存

```javascript
// 上传成功后更新本地存储，避免重复上传
const updatedUserInfo = {
  ...userInfo,
  avatarUrl: cloudAvatarUrl
};
wx.setStorageSync('userInfo', updatedUserInfo);
```

## 验证清单

完成以下检查确保问题已解决：

- [ ] 云存储权限已配置（read: true, write: "auth != null"）
- [ ] 旧的测试数据已清除
- [ ] 重新参与抽签
- [ ] 控制台显示"头像上传成功"
- [ ] 控制台显示云存储路径（cloud://开头）
- [ ] 云存储中能看到上传的文件（在"存储"标签中）
- [ ] 刷新页面后头像正常显示
- [ ] 头像是真实图片，不是占位图

## 预期效果

修复后，参与者列表应该显示：

```
┌─────────────────────────────────┐
│ 👥 参与者列表  共 3 人    刷新  │
├─────────────────────────────────┤
│ [头像] 明。                选项1 │
│        2026-03-03 09:56         │
├─────────────────────────────────┤
│ [头像] Aiden               选项1 │
│        2026-03-03 10:02         │
├─────────────────────────────────┤
│ [头像] 日进斗金            选项2 │
│        2026-03-03 10:03         │
└─────────────────────────────────┘
```

其中 `[头像]` 应该是真实的用户头像图片。

## 如果仍有问题

如果按照步骤操作后仍然无法显示头像，请检查：

1. 控制台是否有错误信息
2. 云存储权限是否正确配置
3. 云开发环境是否已初始化（检查 app.js）
4. 网络是否正常

提供控制台的完整日志输出，我可以进一步帮助排查。

## 相关文档

- `CLOUD_STORAGE_SETUP.md` - 云存储详细配置指南
- `AVATAR_DISPLAY_GUIDE.md` - 头像显示问题完整排查指南
