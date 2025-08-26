import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// 路由导入
import memberRoutes from './routes/members';
import rechargeRoutes from './routes/recharges';
import orderRoutes from './routes/orders';
import workerRoutes from './routes/workers';
import reportRoutes from './routes/reports';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import logRoutes from './routes/logs';
import commissionRuleRoutes from './routes/commission-rules';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: true, // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/recharges', rechargeRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/commission-rules', commissionRuleRoutes);

// 404处理
app.use('*', (req, res) => {
  console.log('❌ 404 - API端点未找到:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({ 
    message: 'API endpoint not found',
    details: {
      method: req.method,
      url: req.url,
      path: req.path,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        '/health',
        '/api/v1/auth',
        '/api/v1/users',
        '/api/v1/members',
        '/api/v1/recharges',
        '/api/v1/orders',
        '/api/v1/workers',
        '/api/v1/reports',
        '/api/v1/logs',
        '/api/v1/commission-rules'
      ]
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 数据库连接和服务器启动
async function startServer() {
  try {
    // 测试数据库连接
    console.log('🔌 开始测试数据库连接...');
    console.log('📊 数据库配置:', {
      host: '192.168.50.17',
      port: 3306,
      database: 'payboard',
      username: 'root',
      dialect: 'mysql'
    });
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步数据库模型
    console.log('🔄 开始同步数据库模型...');
    await sequelize.sync({ force: false });
    console.log('✅ 数据库模型同步成功');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log('🚀 服务器启动成功');
      console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 服务器地址: http://localhost:${PORT}`);
      console.log(`🔗 API基础地址: http://localhost:${PORT}/api/v1`);
      console.log('📋 可用端点:');
      console.log('   - /health (健康检查)');
      console.log('   - /api/v1/auth (用户认证)');
      console.log('   - /api/v1/users (用户管理)');
      console.log('   - /api/v1/members (会员管理)');
      console.log('   - /api/v1/recharges (充值管理)');
      console.log('   - /api/v1/orders (订单管理)');
      console.log('   - /api/v1/workers (打手管理)');
      console.log('   - /api/v1/reports (报表管理)');
      console.log('   - /api/v1/logs (日志管理)');
      console.log('   - /api/v1/commission-rules (分成规则)');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      errorType: (error as Error).constructor.name,
      timestamp: new Date().toISOString()
    });
    
    if ((error as Error).message.includes('ECONNREFUSED')) {
      console.error('🔌 数据库连接被拒绝，请检查:');
      console.error('   1. MySQL服务是否正在运行');
      console.error('   2. 数据库地址 192.168.50.17:3306 是否正确');
      console.error('   3. 防火墙是否阻止了连接');
    } else if ((error as Error).message.includes('ER_ACCESS_DENIED_ERROR')) {
      console.error('🔐 数据库访问被拒绝，请检查:');
      console.error('   1. 用户名 root 是否正确');
      console.error('   2. 密码 123456 是否正确');
      console.error('   3. 用户是否有访问 payboard 数据库的权限');
    } else if ((error as Error).message.includes('ER_BAD_DB_ERROR')) {
      console.error('🗄️ 数据库不存在，请检查:');
      console.error('   1. payboard 数据库是否已创建');
      console.error('   2. 是否需要先导入 payboard.sql');
    }
    
    console.error('💡 建议的解决步骤:');
    console.error('   1. 检查MySQL服务状态');
    console.error('   2. 验证数据库连接信息');
    console.error('   3. 确认数据库和表是否存在');
    console.error('   4. 检查网络连接');
    
    process.exit(1);
  }
}

startServer();

export default app;

