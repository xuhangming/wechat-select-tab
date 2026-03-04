# 数据库配置说明

## 数据库集合

本项目需要创建以下两个数据库集合：

### 1. lottery_events（抽签活动集合）

存储抽签活动信息。

**字段结构：**
```javascript
{
  _id: String,              // 自动生成的文档ID
  title: String,            // 抽签标题，最大50字符
  categories: [{            // 类目列表
    name: String,           // 类目名称
    quantity: Number,       // 总数量
    remaining: Number       // 剩余数量
  }],
  startTime: Date,          // 开始时间
  endTime: Date,            // 结束时间
  creatorId: String,        // 创建者openid
  createTime: Date,         // 创建时间戳
  _openid: String           // 微信云数据库自动字段
}
```

**索引配置：**
1. 索引名称：`creatorId_1`
   - 字段：`creatorId`
   - 类型：升序
   - 用途：用于查询用户创建的活动列表

2. 索引名称：`createTime_-1`
   - 字段：`createTime`
   - 类型：降序
   - 用途：用于按时间排序

### 2. lottery_results（抽签结果集合）

存储用户抽签结果。

**字段结构：**
```javascript
{
  _id: String,              // 自动生成的文档ID
  eventId: String,          // 关联的活动ID
  userId: String,           // 参与者openid
  category: String,         // 抽中的类目名称
  createTime: Date,         // 抽签时间戳
  _openid: String           // 微信云数据库自动字段
}
```

**索引配置：**
1. 索引名称：`eventId_1`
   - 字段：`eventId`
   - 类型：升序
   - 用途：用于查询某个活动的所有结果

2. 索引名称：`userId_1_eventId_1`（复合索引）
   - 字段：`userId`（升序）+ `eventId`（升序）
   - 类型：复合索引
   - 用途：用于检查用户是否已参与某个活动

## 创建步骤

### 在微信开发者工具中创建：

1. 打开微信开发者工具
2. 点击"云开发"按钮
3. 进入"数据库"标签
4. 点击"添加集合"按钮

#### 创建 lottery_events 集合：
1. 集合名称：`lottery_events`
2. 创建后，点击"索引管理"
3. 添加索引：
   - 索引1：字段 `creatorId`，类型：升序
   - 索引2：字段 `createTime`，类型：降序

#### 创建 lottery_results 集合：
1. 集合名称：`lottery_results`
2. 创建后，点击"索引管理"
3. 添加索引：
   - 索引1：字段 `eventId`，类型：升序
   - 索引2：复合索引，字段 `userId`（升序）+ `eventId`（升序）

### 权限设置

建议权限配置：
- **lottery_events**：仅创建者可读写
- **lottery_results**：仅创建者可读写

由于使用云函数操作数据库，实际权限控制在云函数中实现。

## 注意事项

1. 数据库集合创建后不能重命名，请确保名称正确
2. 索引创建后会提升查询性能，建议在开发初期就创建好
3. 云数据库会自动添加 `_openid` 字段，用于标识数据所属用户
4. 开发环境和生产环境需要分别创建数据库集合
