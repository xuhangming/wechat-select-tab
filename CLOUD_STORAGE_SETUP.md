# 云存储配置指南

## 问题原因

参与者头像显示不出来的根本原因是：头像路径是 `wxfile://` 开头的临时文件路径，这些路径：
- 只在当前设备有效
- 刷新页面后失效
- 其他用户无法访问

## 解决方案

需要将头像上传到微信云存储，使用云存储的永久路径。

## 配置步骤

### 1. 开通云存储

1. 打开微信开发者工具
2. 点击"云开发"按钮
3. 进入云开发控制台
4. 点击"存储"标签
5. 如果未开通，点击"开通"按钮

### 2. 配置存储权限

在云开发控制台的"存储"页面：

1. 点击"权限设置"
2. 添加以下权限规则：

```json
{
  "read": true,
  "write": "auth != null"
}
```

这表示：
- 所有人可以读取（显示头像）
- 只有登录用户可以写入（上传头像）

### 3. 创建 avatars 文件夹（可选）

虽然代码会自动创建路径，但你可以手动创建：

1. 在云存储中点击"上传文件"
2. 选择任意图片
3. 上传路径填写：`avatars/test.jpg`
4. 这样就创建了 avatars 文件夹

### 4. 测试上传功能

修改代码后，重新参与抽签：

1. 清除旧的测试数据（可选）
2. 在详情页点击"参与抽签"
3. 观察控制台输出：

```
检测到临时文件路径，开始上传到云存储... wxfile://tmp_xxx.jpg
上传结果: {fileID: "cloud://xxx.jpg", statusCode: 200}
头像上传成功，云存储路径: cloud://xxx.jpg
最终使用的头像路径: cloud://xxx.jpg
```

4. 检查云存储中是否有新上传的文件

### 5. 验证头像显示

1. 刷新详情页
2. 查看参与者列表
3. 应该能看到头像正常显示

## 常见问题

### Q: 上传失败，提示权限错误

A: 检查云存储权限设置，确保 `write: "auth != null"`

### Q: 上传成功但图片不显示

A: 检查云存储权限设置，确保 `read: true`

### Q: 控制台显示"云存储未初始化"

A: 在 `app.js` 中确保已初始化云开发：

```javascript
wx.cloud.init({
  env: 'your-env-id', // 你的云开发环境ID
  traceUser: true
});
```

### Q: 如何清理旧数据

在云开发控制台：

1. 进入"数据库"
2. 选择 `lottery_results` 集合
3. 删除测试数据
4. 重新参与抽签

## 代码改进说明

### 改进点 1: 详细日志

添加了更详细的日志输出，方便排查问题：

```javascript
console.log('检测到临时文件路径，开始上传到云存储...', userInfo.avatarUrl);
console.log('上传结果:', uploadRes);
console.log('头像上传成功，云存储路径:', cloudAvatarUrl);
console.log('最终使用的头像路径:', cloudAvatarUrl);
```

### 改进点 2: 上传提示

添加了加载提示，提升用户体验：

```javascript
wx.showLoading({
  title: '上传头像中...',
  mask: true
});
```

### 改进点 3: 错误处理

上传失败时不使用临时路径，而是使用空字符串（显示占位头像）：

```javascript
catch (uploadError) {
  cloudAvatarUrl = '';
  uiFeedback.showToast('头像上传失败，将使用默认头像');
}
```

### 改进点 4: 更新本地缓存

上传成功后更新本地存储，避免重复上传：

```javascript
const updatedUserInfo = {
  ...userInfo,
  avatarUrl: cloudAvatarUrl
};
wx.setStorageSync('userInfo', updatedUserInfo);
```

## 测试清单

- [ ] 云存储已开通
- [ ] 存储权限已配置（read: true, write: "auth != null"）
- [ ] 云开发环境已初始化
- [ ] 清除旧的测试数据
- [ ] 重新参与抽签
- [ ] 控制台显示上传成功
- [ ] 云存储中能看到上传的文件
- [ ] 刷新页面后头像正常显示
- [ ] 其他用户也能看到头像

## 下一步

1. 配置云存储权限
2. 清除旧的测试数据
3. 重新参与抽签
4. 查看控制台日志
5. 验证头像显示

如果仍有问题，请提供控制台的完整日志输出。
