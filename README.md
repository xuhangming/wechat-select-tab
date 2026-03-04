# 抽签小程序

基于微信小程序云开发的抽签应用，用于将任务随机分配给参与者。

## 功能特性

- 创建自定义抽签活动
- 设置多个类目和数量
- 设置活动时间范围
- 随机分配任务给参与者
- 查看历史记录和详细结果
- 完整的错误处理和用户提示

## 技术栈

- 前端：微信小程序（WXML, WXSS, JavaScript）
- 后端：微信云函数（Node.js）
- 数据库：微信云数据库（文档型数据库）
- 认证：微信小程序内置身份认证

## 项目结构

```
lottery-assignment-miniapp/
├── pages/                  # 小程序页面
│   ├── index/             # 主页
│   ├── create/            # 创建抽签页面
│   ├── history/           # 历史记录页面
│   └── detail/            # 抽签详情页面
├── cloudfunctions/        # 云函数
│   ├── createLottery/     # 创建抽签云函数
│   ├── participateLottery/# 参与抽签云函数
│   ├── getLotteryList/    # 获取列表云函数
│   └── getLotteryDetail/  # 获取详情云函数
├── utils/                 # 工具函数
│   ├── api.js            # API调用封装
│   └── util.js           # 通用工具函数
├── database/              # 数据库配置文档
│   └── README.md         # 数据库设置说明
├── app.js                # 小程序入口文件
├── app.json              # 小程序配置
├── app.wxss              # 全局样式
└── project.config.json   # 项目配置
```

## 开发环境设置

### 前置要求

1. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号
3. 开通云开发服务

### 配置步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd lottery-assignment-miniapp
   ```

2. **导入项目到微信开发者工具**
   - 打开微信开发者工具
   - 选择"导入项目"
   - 选择项目目录
   - 填入 AppID（测试可使用测试号）

3. **开通云开发**
   - 在微信开发者工具中点击"云开发"按钮
   - 开通云开发服务
   - 创建云开发环境

4. **配置云环境ID**
   - 打开 `app.js`
   - 在 `wx.cloud.init()` 中填入你的环境ID（可选，不填则使用默认环境）

5. **创建数据库集合**
   - 参考 `database/README.md` 创建数据库集合和索引

6. **上传云函数**
   - 右键点击 `cloudfunctions` 目录
   - 选择"上传并部署：云端安装依赖"
   - 等待所有云函数上传完成

### 本地开发

1. 在微信开发者工具中打开项目
2. 点击"编译"按钮
3. 在模拟器中预览和调试

### 真机调试

1. 点击"预览"按钮
2. 使用微信扫描二维码
3. 在手机上进行真机测试

## 数据库配置

详细的数据库配置说明请参考 [database/README.md](database/README.md)

需要创建的集合：
- `lottery_events`：存储抽签活动
- `lottery_results`：存储抽签结果

## 云函数说明

### createLottery
创建抽签活动，验证输入并保存到数据库。

### participateLottery
参与抽签，随机分配类目并更新数据。

### getLotteryList
获取用户创建的抽签活动列表。

### getLotteryDetail
获取抽签活动详情和所有参与结果。

## 开发进度

- [x] 项目初始化和基础结构
- [ ] 数据验证和错误处理
- [ ] 创建抽签功能
- [ ] 参与抽签功能
- [ ] 历史记录查询
- [ ] 详情页面展示
- [ ] 用户授权和身份管理
- [ ] UI优化和测试

## 注意事项

1. 云函数需要单独上传和部署
2. 数据库集合需要手动创建
3. 开发环境和生产环境需要分别配置
4. 建议使用测试环境进行开发调试

## 许可证

MIT License
