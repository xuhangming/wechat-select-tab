# 状态一致性修复说明

## 问题描述

抽签历史页面和抽签详情页的活动状态显示不一致。

## 问题原因

虽然两个页面的状态计算逻辑看起来相同，但存在以下问题：

1. **代码重复**：两个页面各自实现了状态计算逻辑
2. **维护困难**：如果需要修改状态逻辑，需要同时修改两处
3. **潜在不一致**：未来修改时可能导致两处逻辑不同步

## 解决方案

创建统一的状态计算工具函数，确保所有页面使用相同的逻辑。

## 实现细节

### 1. 在 utils/util.js 中添加统一函数

```javascript
/**
 * 计算抽签活动状态
 * 统一的状态计算逻辑，确保详情页和列表页状态一致
 * @param {Object} event - 活动对象，包含 startTime, endTime, categories
 * @returns {String} 'not_started' | 'ongoing' | 'ended'
 */
const getEventStatus = (event) => {
  if (!event) return 'ended';
  
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  // 未开始
  if (now < startTime) {
    return 'not_started';
  }
  
  // 已结束（时间已过）
  if (now > endTime) {
    return 'ended';
  }
  
  // 检查是否所有类目都已抽完
  if (event.categories && event.categories.length > 0) {
    const allCategoriesFull = event.categories.every(cat => cat.remaining === 0);
    if (allCategoriesFull) {
      return 'ended';
    }
  }
  
  // 进行中
  return 'ongoing';
};
```

### 2. 更新详情页 (pages/detail/detail.js)

**引入工具函数：**
```javascript
const { getEventStatus } = require('../../utils/util');
```

**使用统一函数：**
```javascript
// 计算活动状态（使用统一的工具函数）
const status = getEventStatus(event);
```

**删除本地方法：**
删除了 `getStatus(event)` 方法，避免代码重复。

### 3. 更新历史页 (pages/history/history.js)

**引入工具函数：**
```javascript
const { formatTime, getEventStatus } = require('../../utils/util');
```

**使用统一函数：**
```javascript
// 处理列表数据，添加显示字段
const processedList = list.map(item => {
  // 使用统一的状态计算函数
  const status = getEventStatus(item);
  
  return {
    ...item,
    status,
    createTimeDisplay: formatTime(new Date(item.createTime)),
    startTimeDisplay: formatTime(new Date(item.startTime)),
    endTimeDisplay: formatTime(new Date(item.endTime))
  };
});
```

**删除本地逻辑：**
删除了内联的状态计算代码，使用统一函数。

## 状态计算规则

### 规则说明

1. **未开始 (not_started)**
   - 当前时间 < 开始时间

2. **已结束 (ended)**
   - 当前时间 > 结束时间
   - 或者所有类目的剩余数量都为 0

3. **进行中 (ongoing)**
   - 当前时间在开始时间和结束时间之间
   - 且至少有一个类目还有剩余数量

### 边界条件

- 使用 `<` 和 `>` 进行比较（不包含等于）
- 当前时间 = 开始时间 → 进行中
- 当前时间 = 结束时间 → 进行中
- 当前时间 > 结束时间 → 已结束

### 特殊情况

- 如果 event 为 null 或 undefined → 返回 'ended'
- 如果 categories 为空数组 → 返回 'ongoing'（如果在时间范围内）
- 如果 categories 不存在 → 返回 'ongoing'（如果在时间范围内）

## 优势

### 1. 一致性保证

✅ 所有页面使用相同的状态计算逻辑
✅ 避免了不同页面显示不同状态的问题
✅ 确保用户体验的一致性

### 2. 可维护性

✅ 单一职责：状态计算逻辑集中在一个地方
✅ 易于修改：只需修改一处代码
✅ 易于测试：可以单独测试状态计算函数

### 3. 可扩展性

✅ 如果需要添加新的状态，只需修改工具函数
✅ 其他页面可以直接使用这个函数
✅ 便于添加更复杂的状态逻辑

### 4. 代码质量

✅ 减少代码重复（DRY 原则）
✅ 提高代码可读性
✅ 降低维护成本

## 测试验证

所有 146 个测试通过 ✅

测试覆盖：
- 状态计算逻辑
- 详情页状态显示
- 历史页状态显示
- 边界条件处理

## 使用示例

### 在详情页中使用

```javascript
const { getEventStatus } = require('../../utils/util');

// 计算状态
const status = getEventStatus(event);

// 根据状态显示不同内容
if (status === 'not_started') {
  // 显示"活动未开始"
} else if (status === 'ongoing') {
  // 显示"立即参与"按钮
} else {
  // 显示"活动已结束"
}
```

### 在列表页中使用

```javascript
const { getEventStatus } = require('../../utils/util');

// 批量计算状态
const processedList = list.map(item => ({
  ...item,
  status: getEventStatus(item)
}));
```

### 在其他页面中使用

任何需要显示活动状态的页面都可以使用这个函数：

```javascript
const { getEventStatus } = require('../../utils/util');

const status = getEventStatus(event);
const statusText = {
  'not_started': '未开始',
  'ongoing': '进行中',
  'ended': '已结束'
}[status];
```

## 相关文件

- `utils/util.js` - 统一的状态计算函数
- `pages/detail/detail.js` - 详情页（已更新）
- `pages/history/history.js` - 历史页（已更新）

## 未来改进

如果需要添加更多状态相关功能，可以考虑：

1. **状态文本映射**
   ```javascript
   const getStatusText = (status) => {
     const map = {
       'not_started': '未开始',
       'ongoing': '进行中',
       'ended': '已结束'
     };
     return map[status] || '';
   };
   ```

2. **状态样式类**
   ```javascript
   const getStatusClass = (status) => {
     return `status-${status}`;
   };
   ```

3. **状态图标**
   ```javascript
   const getStatusIcon = (status) => {
     const icons = {
       'not_started': '⏰',
       'ongoing': '🎯',
       'ended': '✅'
     };
     return icons[status] || '';
   };
   ```

## 总结

通过创建统一的状态计算工具函数，我们：

1. ✅ 解决了状态显示不一致的问题
2. ✅ 提高了代码的可维护性
3. ✅ 减少了代码重复
4. ✅ 确保了所有 146 个测试通过

现在详情页和历史页的状态显示完全一致！
