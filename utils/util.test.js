// utils/util.test.js
// 数据验证工具函数的单元测试

const {
  validateTitle,
  validateCategories,
  validateTimeRange,
  validateLotteryData
} = require('./util.js');

describe('数据验证工具函数测试', () => {
  
  describe('validateTitle - 标题验证', () => {
    
    test('应该接受有效的标题', () => {
      const result = validateTitle('测试抽签活动');
      expect(result.valid).toBe(true);
      expect(result.error).toBe(null);
    });
    
    test('应该拒绝空标题', () => {
      const result = validateTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('标题不能为空');
    });
    
    test('应该拒绝null标题', () => {
      const result = validateTitle(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('标题不能为空');
    });
    
    test('应该拒绝undefined标题', () => {
      const result = validateTitle(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('标题不能为空');
    });
    
    test('应该拒绝只包含空格的标题', () => {
      const result = validateTitle('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('标题不能为空');
    });
    
    test('应该拒绝超过50字符的标题', () => {
      const longTitle = '这是一个非常长的标题'.repeat(10);
      const result = validateTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('标题长度不能超过50个字符');
    });
    
    test('应该接受恰好50字符的标题', () => {
      const title = '1234567890'.repeat(5); // 50个字符
      const result = validateTitle(title);
      expect(result.valid).toBe(true);
      expect(result.error).toBe(null);
    });
    
    test('应该拒绝非字符串类型', () => {
      const result = validateTitle(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('标题不能为空');
    });
  });
  
  describe('validateCategories - 类目验证', () => {
    
    test('应该接受有效的类目列表', () => {
      const categories = [
        { name: '类目1', quantity: 5 },
        { name: '类目2', quantity: 10 }
      ];
      const result = validateCategories(categories);
      expect(result.valid).toBe(true);
      expect(result.error).toBe(null);
    });
    
    test('应该拒绝非数组类型', () => {
      const result = validateCategories('not an array');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('类目必须是数组');
    });
    
    test('应该拒绝空数组', () => {
      const result = validateCategories([]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('至少需要一个类目');
    });
    
    test('应该拒绝类目名称为空', () => {
      const categories = [{ name: '', quantity: 5 }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('名称不能为空');
    });
    
    test('应该拒绝类目名称为null', () => {
      const categories = [{ name: null, quantity: 5 }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('名称不能为空');
    });
    
    test('应该拒绝类目名称只包含空格', () => {
      const categories = [{ name: '   ', quantity: 5 }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('名称不能为空');
    });
    
    test('应该拒绝类目数量为0', () => {
      const categories = [{ name: '类目1', quantity: 0 }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('必须是正整数');
    });
    
    test('应该拒绝类目数量为负数', () => {
      const categories = [{ name: '类目1', quantity: -5 }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('必须是正整数');
    });
    
    test('应该拒绝类目数量为小数', () => {
      const categories = [{ name: '类目1', quantity: 5.5 }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('必须是整数');
    });
    
    test('应该拒绝类目数量为非数字', () => {
      const categories = [{ name: '类目1', quantity: '5' }];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('必须是数字');
    });
    
    test('应该正确指出第几个类目有错误', () => {
      const categories = [
        { name: '类目1', quantity: 5 },
        { name: '', quantity: 10 }
      ];
      const result = validateCategories(categories);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('类目2');
    });
  });
  
  describe('validateTimeRange - 时间范围验证', () => {
    
    test('应该接受有效的时间范围', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 60000); // 1分钟后
      const endTime = new Date(now.getTime() + 3600000); // 1小时后
      
      const result = validateTimeRange(startTime, endTime);
      expect(result.valid).toBe(true);
      expect(result.error).toBe(null);
    });
    
    test('应该拒绝开始时间晚于或等于结束时间', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 3600000);
      const endTime = new Date(now.getTime() + 60000);
      
      const result = validateTimeRange(startTime, endTime);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('开始时间必须早于结束时间');
    });
    
    test('应该拒绝开始时间等于结束时间', () => {
      const now = new Date();
      const time = new Date(now.getTime() + 60000);
      
      const result = validateTimeRange(time, time);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('开始时间必须早于结束时间');
    });
    
    test('应该拒绝开始时间早于当前时间', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 60000); // 1分钟前
      const endTime = new Date(now.getTime() + 3600000); // 1小时后
      
      const result = validateTimeRange(startTime, endTime);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('开始时间不能早于当前时间');
    });
    
    test('应该接受字符串格式的时间', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 60000).toISOString();
      const endTime = new Date(now.getTime() + 3600000).toISOString();
      
      const result = validateTimeRange(startTime, endTime);
      expect(result.valid).toBe(true);
      expect(result.error).toBe(null);
    });
    
    test('应该接受时间戳格式的时间', () => {
      const now = Date.now();
      const startTime = now + 60000;
      const endTime = now + 3600000;
      
      const result = validateTimeRange(startTime, endTime);
      expect(result.valid).toBe(true);
      expect(result.error).toBe(null);
    });
    
    test('应该拒绝无效的开始时间格式', () => {
      const endTime = new Date(Date.now() + 3600000);
      
      const result = validateTimeRange('invalid date', endTime);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('开始时间格式无效');
    });
    
    test('应该拒绝无效的结束时间格式', () => {
      const startTime = new Date(Date.now() + 60000);
      
      const result = validateTimeRange(startTime, 'invalid date');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('结束时间格式无效');
    });
  });
  
  describe('validateLotteryData - 完整数据验证', () => {
    
    test('应该接受完全有效的抽签数据', () => {
      const now = new Date();
      const data = {
        title: '测试抽签',
        categories: [
          { name: '类目1', quantity: 5 },
          { name: '类目2', quantity: 10 }
        ],
        startTime: new Date(now.getTime() + 60000),
        endTime: new Date(now.getTime() + 3600000)
      };
      
      const result = validateLotteryData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toBe(null);
    });
    
    test('应该返回所有字段的错误', () => {
      const data = {
        title: '',
        categories: [],
        startTime: new Date(Date.now() - 60000),
        endTime: new Date(Date.now() + 60000)
      };
      
      const result = validateLotteryData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.title).toBeDefined();
      expect(result.errors.categories).toBeDefined();
      expect(result.errors.time).toBeDefined();
    });
    
    test('应该只返回标题错误', () => {
      const now = new Date();
      const data = {
        title: '',
        categories: [{ name: '类目1', quantity: 5 }],
        startTime: new Date(now.getTime() + 60000),
        endTime: new Date(now.getTime() + 3600000)
      };
      
      const result = validateLotteryData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.categories).toBeUndefined();
      expect(result.errors.time).toBeUndefined();
    });
  });
});
