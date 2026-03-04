# 抽签小程序

基于微信小程序云开发的现代化抽签应用，用于将任务随机分配给参与者。采用最新的微信小程序授权方式，提供流畅的用户体验和完善的功能。

## ✨ 功能特性

### 核心功能
- 🎲 **创建抽签活动** - 自定义活动标题、类目和数量
- ⏰ **时间范围设置** - 灵活设置活动开始和结束时间
- 🎯 **随机分配** - 公平的随机算法分配任务
- 👥 **参与者管理** - 显示参与者头像、昵称和抽签结果
- 📊 **实时统计** - 查看各类目的分配进度
- 📜 **历史记录** - 查看我创建的和我参与的抽签活动

### 用户体验
- 🔐 **现代化授权** - 采用微信最新授权方式（头像选择 + 昵称输入）
- 📤 **活动分享** - 支持分享给好友和群聊，快速邀请参与
- 🎨 **精美UI** - 渐变色设计、卡片式布局、流畅动画
- 💾 **云端存储** - 数据安全存储在微信云数据库
- ⚡ **即时反馈** - 完善的加载提示和错误处理
- 📱 **响应式设计** - 适配各种屏幕尺寸

### 技术亮点
- ✅ **完整测试覆盖** - 146+ 单元测试用例
- 🛡️ **数据验证** - 前后端双重验证确保数据安全
- 🔄 **状态管理** - 智能的活动状态判断（未开始/进行中/已结束）
- 🚀 **性能优化** - 数据库索引优化、云存储加速
- 📝 **完善文档** - 详细的开发文档和使用指南

## 🛠️ 技术栈

- **前端框架**: 微信小程序（WXML, WXSS, JavaScript）
- **后端服务**: 微信云函数（Node.js）
- **数据存储**: 微信云数据库（文档型数据库）
- **文件存储**: 微信云存储（用户头像）
- **身份认证**: 微信小程序 OpenID
- **测试框架**: Jest
- **版本控制**: Git

## 📁 项目结构

```
lottery-assignment-miniapp/
├── pages/                      # 小程序页面
│   ├── index/                 # 首页（登录授权 + 主界面）
│   │   ├── index.js          # 页面逻辑
│   │   ├── index.wxml        # 页面结构
│   │   ├── index.wxss        # 页面样式
│   │   └── index.test.js     # 单元测试
│   ├── create/                # 创建抽签页面
│   │   ├── create.js         # 创建逻辑
│   │   ├── create.wxml       # 表单界面
│   │   └── create.wxss       # 表单样式
│   ├── history/               # 历史记录页面
│   │   ├── history.js        # 列表逻辑
│   │   ├── history.wxml      # 列表界面
│   │   ├── history.wxss      # 列表样式
│   │   └── history.test.js   # 单元测试
│   └── detail/                # 抽签详情页面
│       ├── detail.js         # 详情逻辑
│       ├── detail.wxml       # 详情界面
│       ├── detail.wxss       # 详情样式
│       └── detail.test.js    # 单元测试
├── cloudfunctions/            # 云函数
│   ├── createLottery/        # 创建抽签
│   │   ├── index.js         # 云函数逻辑
│   │   ├── index.test.js    # 单元测试
│   │   └── package.json     # 依赖配置
│   ├── participateLottery/   # 参与抽签
│   │   ├── index.js         # 随机分配逻辑
│   │   ├── index.test.js    # 单元测试
│   │   └── package.json     # 依赖配置
│   ├── getLotteryList/       # 获取活动列表
│   │   ├── index.js         # 查询逻辑
│   │   ├── index.test.js    # 单元测试
│   │   └── package.json     # 依赖配置
│   ├── getLotteryDetail/     # 获取活动详情
│   │   ├── index.js         # 详情查询
│   │   ├── index.test.js    # 单元测试
│   │   └── package.json     # 依赖配置
│   └── getMyParticipatedLotteries/  # 获取我参与的活动
│       ├── index.js         # 查询逻辑
│       └── package.json     # 依赖配置
├── utils/                     # 工具函数
│   ├── api.js                # API 调用封装
│   ├── api.test.js           # API 测试
│   ├── util.js               # 通用工具函数
│   ├── util.test.js          # 工具测试
│   ├── errorHandler.js       # 错误处理
│   ├── errorHandler.test.js  # 错误处理测试
│   ├── uiFeedback.js         # UI 反馈封装
│   └── uiFeedback.test.js    # UI 反馈测试
├── database/                  # 数据库文档
│   └── README.md             # 数据库设置说明
├── .kiro/                     # Kiro AI 规范文档
│   └── specs/                # 功能规范
│       └── lottery-assignment-miniapp/
│           ├── requirements.md  # 需求文档
│           ├── design.md       # 设计文档
│           └── tasks.md        # 任务清单
├── app.js                     # 小程序入口
├── app.json                   # 小程序配置
├── app.wxss                   # 全局样式
├── package.json               # 项目配置
└── project.config.json        # 开发者工具配置
```

## 🚀 快速开始

### 前置要求

1. [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) - 最新版本
2. 微信小程序账号 - [注册地址](https://mp.weixin.qq.com/)
3. 开通云开发服务 - 在开发者工具中开通
4. Node.js 环境 - 用于运行测试（可选）

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd lottery-assignment-miniapp
```

#### 2. 导入到微信开发者工具

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录
4. 填入 AppID（可使用测试号）
5. 点击"导入"

#### 3. 开通云开发

1. 在微信开发者工具中点击"云开发"按钮
2. 按提示开通云开发服务
3. 创建云开发环境（建议创建两个环境：开发环境和生产环境）
4. 记录环境 ID

#### 4. 配置云环境

打开 `app.js`，配置云环境 ID（可选，不填则使用默认环境）：

```javascript
wx.cloud.init({
  env: 'your-env-id', // 你的云环境 ID
  traceUser: true
});
```

#### 5. 创建数据库集合

在云开发控制台中创建以下集合：

**lottery_events** - 抽签活动表
```json
{
  "_id": "自动生成",
  "title": "活动标题",
  "categories": [
    {
      "name": "类目名称",
      "total": 10,
      "remaining": 10
    }
  ],
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-01-31T23:59:59.999Z",
  "creatorId": "用户openid",
  "createTime": "2024-01-01T00:00:00.000Z"
}
```

**lottery_results** - 抽签结果表
```json
{
  "_id": "自动生成",
  "eventId": "活动ID",
  "userId": "用户openid",
  "userInfo": {
    "avatarUrl": "头像URL",
    "nickName": "用户昵称"
  },
  "category": "抽中的类目",
  "createTime": "2024-01-01T00:00:00.000Z"
}
```

**创建索引**（提升查询性能）：

在 `lottery_events` 集合中：
- 索引字段：`creatorId`，升序

在 `lottery_results` 集合中：
- 索引字段：`eventId`，升序
- 索引字段：`userId`，升序

详细说明请参考 [database/README.md](database/README.md)

#### 6. 上传云函数

1. 右键点击 `cloudfunctions` 目录
2. 选择"当前环境"（选择你创建的云环境）
3. 右键点击每个云函数文件夹
4. 选择"上传并部署：云端安装依赖"
5. 等待所有云函数上传完成

需要上传的云函数：
- ✅ createLottery
- ✅ participateLottery
- ✅ getLotteryList
- ✅ getLotteryDetail
- ✅ getMyParticipatedLotteries

#### 7. 配置云存储权限（可选）

如果需要用户上传头像，在云开发控制台配置云存储权限：

1. 进入"云开发" → "存储"
2. 点击"权限设置"
3. 添加规则：允许所有用户读取 `avatars/` 目录

#### 8. 编译运行

1. 点击"编译"按钮
2. 在模拟器中预览
3. 首次使用需要完成登录授权

### 本地开发

#### 运行测试

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch
```

#### 真机调试

1. 点击"预览"按钮
2. 使用微信扫描二维码
3. 在手机上进行真机测试

### 环境配置建议

建议创建两个云环境：

1. **开发环境** (`dev-xxxxx`)
   - 用于日常开发和测试
   - 可以随意修改数据
   - 在 `app.js` 中配置为开发环境 ID

2. **生产环境** (`prod-xxxxx`)
   - 用于正式发布
   - 包含真实用户数据
   - 发布前切换到生产环境 ID

## 📖 使用指南

### 用户端使用流程

#### 1. 首次登录

1. 打开小程序，看到登录引导页
2. 点击头像区域，选择头像（可选择微信头像或相册图片）
3. 输入昵称（可使用微信昵称或自定义）
4. 点击"完成登录"按钮
5. 进入主界面

#### 2. 创建抽签活动

1. 在主界面点击"创建抽签"
2. 填写活动标题（必填，最多50字）
3. 添加抽签类目：
   - 点击"添加类目"
   - 输入类目名称和数量
   - 可添加多个类目
   - 可删除不需要的类目
4. 设置活动时间：
   - 选择开始时间（不能早于当前时间）
   - 选择结束时间（必须晚于开始时间）
5. 点击"创建"按钮
6. 创建成功后自动跳转到活动详情页

#### 3. 分享活动

1. 进入活动详情页
2. 点击"📤 分享活动"按钮（仅创建者可见）
3. 选择分享给好友或群聊
4. 或点击右上角"..."菜单，选择"转发"

#### 4. 参与抽签

1. 通过分享链接或历史记录进入活动详情页
2. 查看活动信息和剩余名额
3. 点击"参与抽签"按钮
4. 系统随机分配类目
5. 查看抽签结果

#### 5. 查看历史记录

1. 在主界面点击对应的导航卡片：
   - "我参与的抽签" - 查看参与过的活动
   - "我创建的抽签" - 查看创建的活动
2. 或点击"历史记录"查看所有活动
3. 点击活动卡片进入详情页

### 管理员功能

#### 查看活动详情

作为活动创建者，可以查看：
- 活动基本信息（标题、时间、状态）
- 各类目的分配情况（已分配/总数）
- 所有参与者列表（头像、昵称、抽中类目）
- 按类目分组的参与者

#### 活动状态

系统自动判断活动状态：
- 🟡 **未开始** - 当前时间早于开始时间
- 🟢 **进行中** - 当前时间在开始和结束时间之间
- 🔴 **已结束** - 当前时间晚于结束时间

### 注意事项

1. **登录授权**
   - 必须完成登录授权才能使用功能
   - 头像和昵称信息会保存在本地
   - 清除缓存后需要重新授权

2. **参与限制**
   - 每个用户只能参与一次同一活动
   - 活动必须在进行中才能参与
   - 所有类目名额满后无法参与

3. **时间设置**
   - 开始时间不能早于当前时间
   - 结束时间必须晚于开始时间
   - 活动创建后时间不可修改

4. **数据安全**
   - 所有数据存储在微信云端
   - 用户只能查看自己创建或参与的活动
   - 云函数自动验证用户身份

## 🔧 云函数说明

### createLottery - 创建抽签活动

**功能**: 创建新的抽签活动并保存到数据库

**输入参数**:
```javascript
{
  title: "活动标题",
  categories: [
    { name: "类目1", total: 10 },
    { name: "类目2", total: 5 }
  ],
  startTime: "2024-01-01T00:00:00.000Z",
  endTime: "2024-01-31T23:59:59.999Z"
}
```

**验证规则**:
- 标题不为空且长度 ≤ 50
- 至少有一个类目
- 每个类目名称不为空，数量 > 0
- 开始时间 < 结束时间
- 开始时间 ≥ 当前时间

**返回结果**:
```javascript
{
  success: true,
  eventId: "活动ID",
  message: "创建成功"
}
```

### participateLottery - 参与抽签

**功能**: 用户参与抽签，随机分配类目

**输入参数**:
```javascript
{
  eventId: "活动ID",
  userInfo: {
    avatarUrl: "头像URL",
    nickName: "用户昵称"
  }
}
```

**验证规则**:
- 活动存在且在进行中
- 用户未参与过此活动
- 至少有一个类目有剩余名额

**分配算法**:
1. 筛选出剩余数量 > 0 的类目
2. 使用 Math.random() 随机选择一个类目
3. 更新该类目的剩余数量 -1
4. 保存用户的抽签结果

**返回结果**:
```javascript
{
  success: true,
  category: "抽中的类目",
  message: "参与成功"
}
```

### getLotteryList - 获取活动列表

**功能**: 获取用户创建的抽签活动列表

**输入参数**: 无（自动获取当前用户 openid）

**返回结果**:
```javascript
{
  success: true,
  events: [
    {
      _id: "活动ID",
      title: "活动标题",
      startTime: "开始时间",
      endTime: "结束时间",
      createTime: "创建时间",
      status: "进行中" // 未开始/进行中/已结束
    }
  ]
}
```

### getLotteryDetail - 获取活动详情

**功能**: 获取活动详细信息和所有参与结果

**输入参数**:
```javascript
{
  eventId: "活动ID"
}
```

**返回结果**:
```javascript
{
  success: true,
  event: {
    _id: "活动ID",
    title: "活动标题",
    categories: [...],
    startTime: "开始时间",
    endTime: "结束时间",
    status: "进行中"
  },
  results: [
    {
      userId: "用户ID",
      userInfo: {
        avatarUrl: "头像",
        nickName: "昵称"
      },
      category: "抽中类目",
      createTime: "参与时间"
    }
  ]
}
```

### getMyParticipatedLotteries - 获取我参与的活动

**功能**: 获取当前用户参与过的所有抽签活动

**输入参数**: 无（自动获取当前用户 openid）

**返回结果**:
```javascript
{
  success: true,
  events: [
    {
      _id: "活动ID",
      title: "活动标题",
      category: "我抽中的类目",
      startTime: "开始时间",
      endTime: "结束时间",
      status: "已结束"
    }
  ]
}
```

## 🧪 测试

项目包含完整的单元测试覆盖：

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 查看测试覆盖率
npm test -- --coverage
```

### 测试覆盖

- ✅ **工具函数测试** (utils/)
  - api.test.js - API 调用测试
  - util.test.js - 工具函数测试
  - errorHandler.test.js - 错误处理测试
  - uiFeedback.test.js - UI 反馈测试

- ✅ **云函数测试** (cloudfunctions/)
  - createLottery/index.test.js - 创建逻辑测试
  - participateLottery/index.test.js - 参与逻辑测试
  - getLotteryList/index.test.js - 列表查询测试
  - getLotteryDetail/index.test.js - 详情查询测试

- ✅ **页面逻辑测试** (pages/)
  - index/index.test.js - 首页逻辑测试
  - history/history.test.js - 历史记录测试
  - detail/detail.test.js - 详情页测试

### 测试统计

- 总测试用例: 146+
- 测试通过率: 100%
- 代码覆盖率: 高

## 📚 相关文档

- [数据库配置说明](database/README.md) - 数据库集合和索引设置
- [需求文档](.kiro/specs/lottery-assignment-miniapp/requirements.md) - 详细功能需求
- [设计文档](.kiro/specs/lottery-assignment-miniapp/design.md) - 系统设计和架构
- [任务清单](.kiro/specs/lottery-assignment-miniapp/tasks.md) - 开发任务列表
- [登录授权说明](LOGIN_REQUIREMENT_UPDATE.md) - 新版授权方式说明
- [头像显示指南](AVATAR_DISPLAY_GUIDE.md) - 头像功能实现和排查
- [分享功能指南](SHARE_FEATURE_GUIDE.md) - 活动分享功能使用

## 🎯 开发进度

### 已完成功能 ✅

- [x] 项目初始化和基础结构
- [x] 数据验证和错误处理
- [x] 创建抽签功能
- [x] 参与抽签功能（随机分配算法）
- [x] 历史记录查询（我创建的 + 我参与的）
- [x] 详情页面展示（参与者列表、类目统计）
- [x] 用户授权和身份管理（新版授权方式）
- [x] 头像和昵称显示
- [x] 活动分享功能
- [x] 活动状态判断（未开始/进行中/已结束）
- [x] UI 优化和美化（渐变色、卡片式布局）
- [x] 完整的单元测试覆盖
- [x] 错误处理和用户提示
- [x] 云存储集成（用户头像）
- [x] 数据库索引优化

### 功能特性

#### 用户体验
- ✨ 现代化登录授权（头像选择 + 昵称输入）
- ✨ 精美的渐变色 UI 设计
- ✨ 流畅的页面切换动画
- ✨ 完善的加载和错误提示
- ✨ 响应式布局适配

#### 核心功能
- 🎲 灵活的抽签创建（多类目、自定义数量）
- ⏰ 智能的时间范围控制
- 🎯 公平的随机分配算法
- 👥 完整的参与者信息展示
- 📊 实时的类目统计
- 📤 便捷的活动分享

#### 技术实现
- 🛡️ 前后端双重数据验证
- 💾 云数据库持久化存储
- 🔐 基于 OpenID 的身份认证
- ⚡ 数据库索引性能优化
- 🧪 完整的单元测试覆盖

## 🔮 未来优化方向

### 功能增强
- [ ] 活动编辑功能（修改标题、类目、时间）
- [ ] 活动删除功能
- [ ] 抽签结果导出（Excel、图片）
- [ ] 活动模板功能（快速创建常用活动）
- [ ] 抽签动画效果（转盘、抽卡等）
- [ ] 活动评论和反馈
- [ ] 活动收藏功能

### 数据统计
- [ ] 活动参与度统计
- [ ] 用户活跃度分析
- [ ] 类目热度排行
- [ ] 分享效果统计

### 社交功能
- [ ] 活动海报生成（带二维码）
- [ ] 分享奖励机制
- [ ] 好友邀请功能
- [ ] 活动排行榜

### 性能优化
- [ ] 图片懒加载
- [ ] 数据分页加载
- [ ] 缓存策略优化
- [ ] 云函数性能监控

### 用户体验
- [ ] 暗黑模式支持
- [ ] 多语言支持
- [ ] 无障碍访问优化
- [ ] 离线功能支持

## ⚠️ 注意事项

### 开发环境

1. **云函数部署**
   - 每次修改云函数后需要重新上传
   - 建议使用"上传并部署：云端安装依赖"
   - 注意选择正确的云环境

2. **数据库集合**
   - 集合需要手动创建，不会自动生成
   - 索引需要手动添加以提升性能
   - 开发和生产环境的数据是隔离的

3. **本地存储**
   - 用户信息存储在本地 Storage
   - 清除缓存会导致需要重新授权
   - 不同设备的数据不同步

### 生产环境

1. **权限配置**
   - 云数据库权限：仅创建者可读写
   - 云存储权限：所有用户可读，仅本人可写
   - 云函数权限：自动验证用户身份

2. **性能考虑**
   - 单个活动参与人数建议不超过 1000 人
   - 用户创建的活动数量建议限制
   - 定期清理过期活动数据

3. **成本控制**
   - 云函数调用次数
   - 云数据库读写次数
   - 云存储空间使用
   - 建议开启资源监控和告警

### 兼容性

- **微信版本**: 建议 7.0.0 以上
- **基础库版本**: 2.21.0 以上（支持新版授权）
- **系统要求**: iOS 10.0+ / Android 5.0+

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循微信小程序开发规范
- 添加必要的注释和文档
- 编写单元测试覆盖新功能

## 📄 许可证

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 📞 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 开发者: Kiro AI Assistant

---

**版本**: 1.0.0  
**最后更新**: 2024年  
**开发工具**: 微信开发者工具 + Kiro AI Assistant
