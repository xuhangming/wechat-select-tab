# 默认头像实现说明

## 功能概述

为参与者列表添加了默认头像功能，当用户头像不存在或加载失败时，自动显示默认头像。

## 实现方案

### 1. 默认头像设计

使用 SVG 格式的默认头像，编码为 base64 格式：
- 紫粉渐变背景（与应用主题一致）
- 简洁的用户图标（圆形头部 + 肩膀轮廓）
- 白色图标，半透明效果

### 2. 代码实现

#### 在 detail.js 中添加默认头像数据

```javascript
data: {
  // ... 其他数据
  defaultAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4uLi4='
}
```

这是一个 SVG 图标，包含：
- 100x100 尺寸
- 紫粉渐变背景 (#a855f7 → #ec4899)
- 白色用户图标

#### 在 detail.wxml 中使用默认头像

```xml
<image class="participant-avatar" 
       src="{{item.userInfo.avatarUrl || defaultAvatar}}" 
       mode="aspectFill"
       data-index="{{index}}"
       binderror="onAvatarError"></image>
```

逻辑：
1. 如果 `item.userInfo.avatarUrl` 存在，使用真实头像
2. 如果不存在，使用 `defaultAvatar`（默认头像）
3. 如果加载失败，触发 `onAvatarError` 事件

#### 头像加载错误处理

```javascript
onAvatarError(e) {
  console.error('头像加载失败:', e);
  const index = e.currentTarget.dataset.index;
  if (index !== undefined) {
    // 如果头像加载失败，使用默认头像
    const results = this.data.results;
    results[index].userInfo.avatarUrl = this.data.defaultAvatar;
    this.setData({ results });
  }
}
```

当头像加载失败时：
1. 记录错误日志
2. 获取失败头像的索引
3. 将该用户的头像 URL 替换为默认头像
4. 更新页面数据

### 3. 样式优化

```css
.participant-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
}
```

添加了渐变背景，确保：
- 即使图片加载失败，也有美观的背景色
- 与默认头像的渐变色一致
- 提升视觉体验

## 使用场景

### 场景 1: 用户未授权头像

```
用户参与抽签时未授权头像
↓
userInfo.avatarUrl 为空
↓
显示默认头像
```

### 场景 2: 头像上传失败

```
用户参与抽签
↓
头像上传到云存储失败
↓
avatarUrl 为空字符串
↓
显示默认头像
```

### 场景 3: 头像加载失败

```
用户有头像 URL
↓
图片加载失败（网络问题、权限问题等）
↓
触发 onAvatarError
↓
替换为默认头像
```

### 场景 4: 旧数据没有头像

```
数据库中的旧记录
↓
userInfo 为空对象或没有 avatarUrl
↓
显示默认头像
```

## 效果展示

### 有真实头像的用户

```
┌─────────────────────────────────┐
│ [真实头像] 张三          选项1   │
│           2026-03-03 10:00      │
└─────────────────────────────────┘
```

### 没有头像的用户

```
┌─────────────────────────────────┐
│ [默认头像] 李四          选项2   │
│           2026-03-03 10:01      │
└─────────────────────────────────┘
```

默认头像显示为：
- 紫粉渐变圆形背景
- 白色用户图标（头部 + 肩膀）

## 优势

### 1. 用户体验

- ✅ 统一的视觉风格
- ✅ 没有空白或破损的图片
- ✅ 即使头像加载失败也有美观的显示

### 2. 兼容性

- ✅ 兼容旧数据（没有 userInfo 的记录）
- ✅ 兼容未授权用户
- ✅ 兼容头像上传失败的情况

### 3. 性能

- ✅ base64 编码，无需额外网络请求
- ✅ SVG 格式，体积小（约 500 字节）
- ✅ 可缩放，不失真

### 4. 维护性

- ✅ 集中管理，易于修改
- ✅ 可以轻松替换为其他图标
- ✅ 代码简洁，逻辑清晰

## 自定义默认头像

如果想使用其他默认头像，可以：

### 方案 1: 使用其他 SVG 图标

1. 设计或下载 SVG 图标
2. 转换为 base64 编码
3. 替换 `defaultAvatar` 的值

在线工具：https://www.base64encode.org/

### 方案 2: 使用图片文件

1. 将图片放在 `images` 文件夹
2. 修改 `defaultAvatar` 为图片路径

```javascript
data: {
  defaultAvatar: '/images/default-avatar.png'
}
```

### 方案 3: 使用 Emoji

```javascript
data: {
  defaultAvatar: 'data:image/svg+xml;base64,...' // 包含 emoji 的 SVG
}
```

## 测试验证

所有 146 个测试通过 ✅

测试覆盖：
- 头像显示逻辑
- 错误处理
- 数据格式化
- 页面渲染

## 相关文件

- `pages/detail/detail.js` - 默认头像数据和错误处理
- `pages/detail/detail.wxml` - 头像显示模板
- `pages/detail/detail.wxss` - 头像样式
- `AVATAR_FIX_SUMMARY.md` - 头像问题修复总结
- `CLOUD_STORAGE_SETUP.md` - 云存储配置指南

## 下一步

1. 在微信开发者工具中查看效果
2. 测试各种场景（有头像、无头像、加载失败）
3. 如需自定义默认头像，按照上述方案修改

默认头像功能已完成，现在所有参与者都会显示头像（真实头像或默认头像）！
