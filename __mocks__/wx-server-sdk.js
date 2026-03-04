// __mocks__/wx-server-sdk.js
// wx-server-sdk 的 mock 实现

const mockDb = {
  collection: jest.fn()
};

const mockCloud = {
  init: jest.fn(),
  database: jest.fn(() => mockDb),
  getWXContext: jest.fn(() => ({
    OPENID: 'test-openid-123'
  })),
  DYNAMIC_CURRENT_ENV: 'test-env'
};

module.exports = mockCloud;
