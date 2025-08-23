const axios = require('axios');

const BASE_URL = 'http://localhost:10000/api/v1';

async function testAPI() {
  try {
    console.log('🔍 测试API连接...');
    
    // 测试健康检查
    const healthResponse = await axios.get('http://localhost:10000/health');
    console.log('✅ 健康检查:', healthResponse.data);
    
    // 测试会员列表接口
    const membersResponse = await axios.get(`${BASE_URL}/members`, {
      params: {
        page: 1,
        limit: 10
      }
    });
    console.log('✅ 会员列表:', membersResponse.data);
    
  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data || error.message);
  }
}

testAPI();
